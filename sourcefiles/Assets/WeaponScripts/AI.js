static var numOfSounds = 0;
static var maxNumOfSounds = 10;
static var numOfSteps = 0;
static var maxNumOfSteps = 3;

var speed = 3.0;
private var realSpeed = 0.0;
var rotationSpeed = 5.0;
var shootRange = 60.0;
var attackRange = 100.0;
var shootAngle = 4.0;
var dontComeCloserRange = 40.0;
var pickNextWaypointDistance = 2.0;
var target : Transform;

var walkSounds : AudioClip[];
var audioStepLength = 0.3;

var testTrail : LineRenderer;

private var lastShot = -10.0;
private var seeker : Seeker;
private var path : Pathfinding.Path;
private var currentWaypoint : int;
var objectiveWaypoint : AutoWayPoint;
@HideInInspector
var savedObjectiveWaypoint : AutoWayPoint;
private var first = true;
private var waypointPosition;
private var fireRate;
private var delayShootTime;
private var nearestCover;
private var moveTimeout = 1.5;
private var moveTimeCounter = 0;
private var turning : boolean = false;
private var attacking : boolean = false;
//@HideInInspector
var curWayPoint : AutoWayPoint;
@HideInInspector
var isFollowing : boolean = false;
private var attackWhileFollowing : boolean = false;
@HideInInspector
var resetPath : boolean = false;
@HideInInspector
var isNear : boolean = false;
public var thePlayer : Transform;
private var theGunScript : MachineGunEnemy;
private var ch : CharacterController;
private var distance : float = 10000;
private var shootDelay : float;
private var isStopped : boolean = false;
private var isHolding : boolean = false;
private var crouching : boolean = false;
public var disableAI : boolean = false;
public var isLocal : boolean = false;
@HideInInspector
var isStepping : boolean = false; 

private var visionLayermask : int;

private var completedObjectives : List.<AutoWayPoint>;

public var maximumDistanceFromLeader : float = 50.0;

public static var enemyList : List.<GameObject>;
public var enemyList2 : List.<GameObject>;

public var fear : int;

// Make sure there is always a character controller
@script RequireComponent (CharacterController)

function Start () 
{
	var tempList : GameObject[] = GameObject.FindGameObjectsWithTag("Enemy");
	enemyList = new List.<GameObject>(tempList);
	enemyList2 = enemyList;

	visionLayermask = (1 << 0) | (1 << 14);

	completedObjectives = new List.<AutoWayPoint>();

	ch = GetComponent(CharacterController);

	theGunScript = GetComponent(MachineGunEnemy);
	
	shootDelay = 0.3;

	moveTimeCounter = Time.time;

	fireRate = GetComponent("MachineGunEnemy").fireRate;
	delayShootTime = 0.5*fireRate;
	
	FindTarget();

	PlayStepSounds();
	
	if(GameObject.FindWithTag("Player"))
		thePlayer = GameObject.FindWithTag("Player").transform;
	
	TrackPlayerPosition();
	
	seeker = GetComponent(Seeker);
	
	seeker.StartPath(transform.position,AutoWayPoint.FindClosest(transform.position).transform.position,OnPathComplete);
	
}

function Patrol () 
{
	curWayPoint = AutoWayPoint.FindClosest(transform.position);
	PickNextWaypoint(curWayPoint);
	SendMessage("SetObj", objectiveWaypoint.waypointIndex, SendMessageOptions.DontRequireReceiver);
	SendMessage("SetCur", curWayPoint.waypointIndex, SendMessageOptions.DontRequireReceiver);
	while (true) {
		if(disableAI) {
			yield StartCoroutine("IdleAI");
		}
		if(curWayPoint == null)
			curWayPoint = AutoWayPoint.FindClosest(transform.position);
		else
			waypointPosition = curWayPoint.transform.position;
		if (currentWaypoint >= path.vectorPath.length 
		|| Vector2.Distance(Vector2(waypointPosition.x,waypointPosition.z), Vector2(transform.position.x,transform.position.z)) < pickNextWaypointDistance + 1
		|| resetPath)
		{
			currentWaypoint = 0;
			resetPath = false;
			if(curWayPoint == objectiveWaypoint) {
				if(objectiveWaypoint.objectiveCode == 1) {
					objectiveWaypoint.numOfUnits--;
					yield StartCoroutine("StopForSeconds", 10.0);
					objectiveWaypoint = FindNextObjectiveWaypoint(objectiveWaypoint);
				} else if(objectiveWaypoint.objectiveCode == 2) {
					objectiveWaypoint.numOfUnits--;
					yield StartCoroutine("StopForSeconds", 10.0);
					objectiveWaypoint = FindNextObjectiveWaypoint(objectiveWaypoint);
				}
			} else {
				curWayPoint = PickNextWaypoint(curWayPoint);
			}
			
			if(curWayPoint != null) {
				waypointPosition = curWayPoint.transform.position;
			} else {
				curWayPoint = AutoWayPoint.FindClosest(transform.position);
				waypointPosition = curWayPoint.transform.position;
			}
			seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
		}
		
		// Move towards our target
		MoveTowards();
		
		if(fear >= 500
		&& Random.Range(0,2) == 1)
		{
			Debug.Log("Act of Courage");
			fear -= Random.Range(100,500);
		}
		
		if(fear >= 500)
		{
			Debug.Log("Routing..");
			yield StartCoroutine("Retreat");
		}
		
		if(currentWaypoint < path.vectorPath.length)
		{
			if (Vector2.Distance(Vector2(transform.position.x, transform.position.z), Vector2(path.vectorPath[currentWaypoint].x, path.vectorPath[currentWaypoint].z)) < 2.5) 
			{
				moveTimeCounter = Time.time;
	            currentWaypoint++;
	        }
			else if(Time.time - moveTimeCounter > moveTimeout)
	        {
				currentWaypoint = 0;
				curWayPoint = AutoWayPoint.FindClosest(transform.position);
				if(curWayPoint) {
					waypointPosition = curWayPoint.transform.position;
					seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
				}
		    }
		}
	    	
		if(CanSeeTarget() || attacking)
		{
			attacking = true;
			yield StartCoroutine("StopForSeconds", Random.Range(1.0,3.0));
			attacking = false;
			/*if(Random.Range(1,101) >= 50)
			{
				yield StartCoroutine("TakeCover");
			}
			else
			{*/
				attacking = true;
				yield StartCoroutine("AttackEnemy");
				attacking = false;
			//}
		}
		
		if(isStopped)
		{
			yield StartCoroutine("Stop");
			isStopped = false;
		}
		
		if(isHolding)
		{
			yield StartCoroutine("HoldPosition");
			isHolding = false;
		}
		
		if(isFollowing)
		{
			curWayPoint = objectiveWaypoint;
			yield StartCoroutine("Follow");
			isFollowing = false;
		}
		
		yield;
	}
}


function CanSeeTarget() : boolean 
{
	if(!target)
		return false;
	
	distance = Vector3.Distance(transform.position, target.position);
	if (distance > attackRange)
		return false;
		
	var hit : RaycastHit;
	if (Physics.Raycast(transform.position, target.position, hit, visionLayermask))
		return hit.transform == target;
	else
		return true;

	return false;
}

function CanShootTarget() : boolean 
{
	if(!target)
		return false;
	
	distance = Vector3.Distance(transform.position, target.position);
	if (distance > shootRange)
		return false;
		
	var hit : RaycastHit;
	if (Physics.Raycast(transform.position, target.position, hit, visionLayermask))
		return hit.transform == target;
	else
		return true;

	return false;
}

function Shoot () 
{
	// Start shoot animation
	if(!crouching) {
		animation.CrossFade("shoot");
	} else {
		animation.CrossFade("shoot_crouch");
	}

	// Wait until half the animation has played
	//yield WaitForSeconds(delayShootTime);
	// Fire gun
	SendMessage("Fire");
	
	// Wait for the rest of the animation to finish
	if(isLocal)
		yield WaitForSeconds(/*animation["shoot"].length*/fireRate /*- delayShootTime*/);
		
	if(disableAI) {
		yield StartCoroutine("IdleAI");
	}
}

function Shoot (theHit : Vector3) 
{
	// Start shoot animation
	if(!crouching) {
		animation.CrossFade("shoot");
	} else {
		animation.CrossFade("shoot_crouch");
	}

	// Wait until half the animation has played
	//yield WaitForSeconds(delayShootTime);
	// Fire gun
	SendMessage("Fire", theHit);
	
	// Wait for the rest of the animation to finish
	yield WaitForSeconds(/*animation["shoot"].length*/fireRate /*- delayShootTime*/);
	
	if(disableAI) {
		yield StartCoroutine("IdleAI");
	}
}

function AttackEnemy () 
{
	var aimPoints : float = 0;
	while ((!isFollowing || attackWhileFollowing) && fear < 500) 
	{
		if(disableAI) {
			yield StartCoroutine("IdleAI");
		}
		if (CanSeeTarget()) 
		{
			if(attackWhileFollowing)
			{
				if(Vector3.Distance(transform.position, objectiveWaypoint.transform.position) > maximumDistanceFromLeader)
					return;
			}
			waypointPosition = target.position;
			if (distance > dontComeCloserRange)
			{
				if(currentWaypoint < path.vectorPath.length)
				{
					if (Vector2.Distance(Vector2(transform.position.x,transform.position.z),Vector2(path.vectorPath[currentWaypoint].x,path.vectorPath[currentWaypoint].z)) < 2.5) 
					{
						moveTimeCounter = Time.time;
			            currentWaypoint++;
			        } 
			        else if(Time.time - moveTimeCounter > moveTimeout)
			        {
				    	currentWaypoint = path.vectorPath.length;
				    }
				    else
				    {
						MoveTowards();
				    }
		        }
		        else
		        {
		        	return;
		        }
			}
			else
				RotateTowards (waypointPosition);
				
			
			

			var forward = transform.TransformDirection(Vector3.forward);
			var targetDirection = waypointPosition - transform.position;
			targetDirection.y = 0;
 
			var angle = Vector3.Angle(targetDirection, forward);
			if(angle < shootAngle) {
				if(aimPoints < shootDelay)
					aimPoints += Time.deltaTime;
				else
					aimPoints = shootDelay;
			} else {
				if(aimPoints > 0)
					aimPoints -= Time.deltaTime;
				else
					aimPoints = 0;
			}
			// Start shooting if close and enemy is in sight
			if (distance < shootRange && aimPoints >= shootDelay && !transform.GetComponent(MachineGunEnemy).reloading)
			{
				transform.LookAt(target);
				SendMessage("SetSpeed", 0.0);
				yield StartCoroutine("Shoot");
			}
		} else {
			yield StartCoroutine("SearchPlayer");
			// enemy not visible anymore - stop attacking
			if (!CanSeeTarget ())
				return;
		}

		yield;
	}
}

function ShootEnemy()
{
	var aimPoints : float = 0;
	while(true)
	{
		if(CanShootTarget() && fear < 500) 
		{
			RotateTowards (target.position);
			var forward = transform.TransformDirection(Vector3.forward);
			var targetDirection = target.position - transform.position;
			targetDirection.y = 0;
 
			var angle = Vector3.Angle(targetDirection, forward);
			if(angle < shootAngle) {
				if(aimPoints < shootDelay)
					aimPoints += Time.deltaTime;
				else
					aimPoints = shootDelay;
			} else {
				if(aimPoints > 0)
					aimPoints -= Time.deltaTime;
				else
					aimPoints = 0;
			}
			// Start shooting if close and enemy is in sight
			if (distance < shootRange && aimPoints >= shootDelay && !transform.GetComponent(MachineGunEnemy).reloading)
			{
				transform.LookAt(target);
				yield StartCoroutine("Shoot");
				
			}
		} 
		else 
		{
			return;
		}
		
		yield;
	}
}

function SearchPlayer () {
	// Run towards the player but after 3 seconds timeout and go back to Patroling
	var timeout = 5.0;
	while (timeout > 0.0) 
	{
		MoveTowards();
		if(currentWaypoint < path.vectorPath.length)
		{
			if (Vector2.Distance(Vector2(transform.position.x,transform.position.z),Vector2(path.vectorPath[currentWaypoint].x,path.vectorPath[currentWaypoint].z)) < 2.5) 
			{
				moveTimeCounter = Time.time;
	            currentWaypoint++;
	        } 
	        else if(Time.time - moveTimeCounter > moveTimeout)
	        {
				currentWaypoint = 0;
				curWayPoint = AutoWayPoint.FindClosest(transform.position);
				waypointPosition = curWayPoint.transform.position;
				seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
		    }
        }
        else
        {
        	return;
        }
		
		// We found the player
		if (CanSeeTarget ())
		{
			return;
		}

		timeout -= Time.deltaTime;
		yield;
	}
}

function RotateTowards (position : Vector3) {
	SendMessage("SetSpeed", 0.0);
	turning = true;
	
	var direction = position - transform.position;
	direction.y = 0;
	if (direction.magnitude < 0.1)
		return;
	
	// Rotate towards the target
	transform.rotation = Quaternion.Slerp (transform.rotation, Quaternion.LookRotation(direction), rotationSpeed * Time.deltaTime);
	transform.eulerAngles = Vector3(0, transform.eulerAngles.y, 0);
}

function MoveTowards () {
	
	SendMessage("SetObj", objectiveWaypoint.waypointIndex, SendMessageOptions.DontRequireReceiver);
	SendMessage("SetCur", curWayPoint.waypointIndex, SendMessageOptions.DontRequireReceiver);

	if(path == null)
		return;
	
	if (currentWaypoint >= path.vectorPath.Length)
        return;
    
    //Direction to the next waypoint
    var direction = path.vectorPath[currentWaypoint]-transform.position;

	//var direction = position - transform.position;
	//direction.y = 0;
	if (direction.magnitude < 0.5) {
		SendMessage("SetSpeed", 0.0);
		return;
	}
	
	// Rotate towards the target
	transform.rotation = Quaternion.Slerp (transform.rotation, Quaternion.LookRotation(direction), rotationSpeed * Time.deltaTime);
	transform.eulerAngles = Vector3(0, transform.eulerAngles.y, 0);

	// Modify speed so we slow down when we are not facing the target
	var forward = transform.TransformDirection(Vector3.forward);
	var speedModifier = Vector3.Dot(forward, direction.normalized);
	speedModifier = Mathf.Clamp01(speedModifier);

	// Move the character
	turning = false;
	direction = forward * speed * speedModifier;
	ch.SimpleMove(direction);
	
	SendMessage("SetSpeed", speed * speedModifier, SendMessageOptions.DontRequireReceiver);
	realSpeed = speed * speedModifier;
}

function PickNextWaypoint (currentWaypoint : AutoWayPoint) 
{
	if(objectiveWaypoint != null)
	{
		if(Vector3.Distance(transform.position, objectiveWaypoint.transform.position) < pickNextWaypointDistance + 1)
		{
			return objectiveWaypoint;
		}
		else if(objectiveWaypoint.numOfUnits >= objectiveWaypoint.maxNumOfUnits)
		{
			return FindNextObjectiveWaypoint(currentWaypoint);
		}
		else if(objectiveWaypoint == currentWaypoint)
		{
			return objectiveWaypoint;
		}
		else
		{	
			objectiveWaypoint.numOfUnits++;
			return objectiveWaypoint;
		}
	}
	
	// The direction in which we are walking
	var forward = transform.TransformDirection(Vector3.forward);

	// The closer two vectors, the larger the dot product will be.
	var best = currentWaypoint;
	var bestDot = -10;
	
	// pick a random connected waypoint
	var ranWaypoint = Random.Range(0,currentWaypoint.connected.Count);
	best = currentWaypoint.connected[ranWaypoint];
	
	// Find waypoint where you turn the least
	for (var cur : AutoWayPoint in currentWaypoint.connected) {
		var direction = Vector3.Normalize(cur.transform.position - transform.position);
		var dot = Vector3.Dot(direction, forward);
		//var dot = Vector3.Distance(transform.position, cur.transform.position);
		if (dot > bestDot && cur != currentWaypoint) {
			bestDot = dot;
			best = cur;
		}
	}
	if(best == currentWaypoint)
	{
		var bestDistance = float.MaxValue;
		for (var cur : AutoWayPoint in AutoWayPoint.waypoints) {
			var distance = Vector3.Distance(cur.transform.position, transform.position);
			if (distance < bestDistance && cur != currentWaypoint) {
				bestDistance = distance;
				best = cur;
			}
		}
	}
	if(currentWaypoint.connected.Count < 1)
		Debug.Log("NO CONNECTED WAYPOINTS");
	
	return best;
}

function FindNextObjectiveWaypoint(currentWaypoint : AutoWayPoint)
{ 
	var connectedLength : int = objectiveWaypoint.connected.Count;
	completedObjectives.Add(currentWaypoint);
	if(connectedLength != 0)
	{  
		var tempWaypoint : AutoWayPoint;
		var finalWaypoint : AutoWayPoint;
		var closestDistance = 10000;
		//var ranNum : int = Random.Range(0,connectedLength);
		for(var i = 0; i < connectedLength; i++)
		{  
			tempWaypoint = objectiveWaypoint.connected[i];
			if(tempWaypoint.teamCode != GetComponent(TeamNumber).team || findIndex(tempWaypoint) != -1 || !tempWaypoint)
				continue;
			tempDistance = Vector3.Distance(tempWaypoint.transform.position,transform.position);
			if(tempWaypoint != null && tempWaypoint.numOfUnits < tempWaypoint.maxNumOfUnits && tempDistance < closestDistance)
			{
				finalWaypoint = tempWaypoint;
				closestDistance = tempDistance;
			}
			//ranNum = (ranNum+1)%connectedLength;
		}
		if(closestDistance != 10000) {
			objectiveWaypoint = finalWaypoint;
			objectiveWaypoint.numOfUnits++; 
		}
	}
	return objectiveWaypoint;
}

function OnPathComplete(p : Pathfinding.Path)
{
	if(!p.error)
	{
		path = p;
		currentWaypoint = 0;
		if(first)
		{
			Patrol();
			first = false;
		}
	}
}

function TakeCover()
{
	var coverSpots : Collider[] = Physics.OverlapSphere(transform.position, 10);
	for(var c : Collider in coverSpots)
	{
		if(c.GetComponent(IsCover) && c.GetComponent(IsCover).occupied == false)
		{
			var tempCover : Transform = c.transform;
			var hit : RaycastHit;
			var layerMask = (1 << 0);
			if(target && Physics.Raycast(target.position, tempCover.position, hit, layerMask))
			{
				/*if(testTrail)
				{
					testTrail.SetPosition(0, target.position);
					testTrail.SetPosition(1, tempCover.position);
					testTrail.SetWidth(0.1,0.1);
					Instantiate(testTrail, target.position, target.rotation);
				}*/
				if(nearestCover)
				{
					if(Vector3.Distance(transform.position,tempCover.position) < Vector3.Distance(transform.position,nearestCover.position)
					&& Vector3.Distance(transform.position,tempCover.position) > pickNextWaypointDistance + 1)
					{
						nearestCover = tempCover;
					}
				} else {
					nearestCover = tempCover;
				}
			}
		}
	}
	
	if(nearestCover)
	{
		nearestCover.GetComponent(IsCover).occupied = true;
		
		waypointPosition = nearestCover.position;
		seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
		currentWaypoint = 0;
	
		while(true)
		{
			//yield WaitForSeconds(0.05);
			/*if(CanSeeTarget())
			{*/
				// Target is dead - stop covering
				if (target == null)
					return;
		
				// Target is too far away - stop covering	
				var distance = Vector3.Distance(transform.position, target.position);
				if (distance > shootRange * 3)
					return;
				
				if(currentWaypoint < path.vectorPath.length)
				{
					MoveTowards();
					if (Vector3.Distance(transform.position,path.vectorPath[currentWaypoint]) < 2.5) 
					{
						moveTimeCounter = Time.time;
			            currentWaypoint++;
			        } 
			        else if(Time.time - moveTimeCounter > moveTimeout) 
			       	{
			        	currentWaypoint = path.vectorPath.length;
			        }
			    }
		        
		        if(currentWaypoint >= path.vectorPath.length-1 ||
		        Vector3.Distance(transform.position, waypointPosition) < pickNextWaypointDistance + 1)
		        {
		        	nearestCover.GetComponent(IsCover).occupied = false;
					currentWaypoint = path.vectorPath.length;
		        	return;
		        }
		    /*} else {
				yield StartCoroutine("SearchPlayer", waypointPosition);
				// Player not visible anymore - stop attacking
				if (!CanSeeTarget ())
					return;
		    }*/
		    
		    yield;
		}
	}
}

function PlayStepSounds () {

	while (true) {
		if (!isHolding && !isStopped && isNear && ch.isGrounded) {
			if(numOfSteps < maxNumOfSteps) {
				audio.PlayOneShot(walkSounds[Random.Range(0, walkSounds.length)]);
				numOfSteps++;
				isStepping = true;
				yield WaitForSeconds(audioStepLength);
				numOfSteps--;
				isStepping = false;
			} else {
				yield WaitForSeconds(audioStepLength);
			}
		} else {
			yield WaitForSeconds(1);
		}
	}
}

function FindTarget()
{
	while(true)
	{
		enemyList2 = enemyList;
		if(!disableAI)
		{
			TrackPlayerPosition();
			
			var tempTarget = null;
			//var tempTarget2 = target;
			//var tempTarget3 = target;
			var closestTarget : float = float.MaxValue;
			for(var enemy : GameObject in enemyList)
			{
				if(enemy && enemy.GetComponent(TeamNumber).team != GetComponent(TeamNumber).team)
				{
					var tempDistance = Vector3.Distance(enemy.transform.position, transform.position);
					if(tempDistance < closestTarget && !Physics.Linecast(enemy.transform.position,transform.position,visionLayermask))
					{
						closestTarget = tempDistance;
						/*tempTarget3 = tempTarget2;
						tempTarget2 = tempTarget;*/
						tempTarget = enemy.transform;
					}
				}
			}
			if(thePlayer && thePlayer.GetComponent(TeamNumber) && thePlayer.GetComponent(TeamNumber).team != GetComponent(TeamNumber).team) {
				if(Vector3.Distance(thePlayer.position, transform.position) < closestTarget
				&& !Physics.Linecast(thePlayer.position,transform.position,visionLayermask)) {
					tempTarget = thePlayer;
				}
			}
			//if(tempTarget != target) {
				/*var ranInt = Random.Range(1.0,4.0);
				if(ranInt > 3 && tempTarget3 != target) {
					target = tempTarget3;
				} else if(ranInt > 2 && tempTarget2 != target) {
					target = tempTarget2;
				} else {*/
					target = tempTarget;
				//}
			//}
		}
		yield WaitForSeconds(3);
	}
}



function TrackPlayerPosition()
{
	if(thePlayer) {
		if(Vector3.Distance(thePlayer.position, transform.position) < 50.0) {
			isNear = true;
			theGunScript.isNear = true;
		} else {
			isNear = false;
			theGunScript.isNear = false; 
		}
	} else {
		if(GameObject.FindWithTag("Player"))
		{
			thePlayer = GameObject.FindWithTag("Player").transform;
			GetComponent(MachineGunEnemy).thePlayer = thePlayer;
		}
	}
}

function Stop()
{
	SendMessage("SetSpeed", 0.0);
	while(!isFollowing)
	{
		if (CanSeeTarget())
		{
			attacking = true;
			yield StartCoroutine("ShootEnemy");
			attacking = false;
			return;
		}
		
		yield;
	}
}

function StopForSeconds(s : float)
{
	var seconds : float = s;
	if(Random.Range(0,2) == 0) {
		SendMessage("SetCrouch", true);
		crouching = true;
	}
	SendMessage("SetSpeed", 0.0);
	while(!isFollowing && seconds > 0 && fear < 500)
	{
		
		
		if (CanSeeTarget() || attacking)
		{
			attacking = true;
			yield StartCoroutine("ShootEnemy");
			attacking = false;
			crouching = false;
			SendMessage("SetCrouch", false);
			SendMessage("SetSpeed", 0.0);
			return;
		}
		
		yield;
		
		seconds -= Time.deltaTime;
	}
	crouching = false;
	SendMessage("SetCrouch", false);
	SendMessage("SetSpeed", 0.0);
}

function HoldPosition()
{
	SendMessage("SetSpeed", 0.0);
	while(!isFollowing)
	{
		if (CanShootTarget())
		{
			attacking = true;
			yield StartCoroutine("ShootEnemy");
			attacking = false;
		}
		
		yield;
	}
}

function Follow()
{
	UpdateWaypointPosition();
	while(isFollowing)
	{
		if(CanSeeTarget() || attacking)
		{
			/*if(Random.Range(1,101) >= 50)
			{
				yield StartCoroutine("TakeCover");
			}
			else
			{*/
				attacking = true;
				attackWhileFollowing = true;
				yield StartCoroutine("AttackEnemy");
				attackWhileFollowing = false;
				attacking = false;
			//}
		}
		
		if(currentWaypoint < path.vectorPath.length)
		{
			if (Vector2.Distance(Vector2(transform.position.x,transform.position.z),Vector2(path.vectorPath[currentWaypoint].x,path.vectorPath[currentWaypoint].z)) < 2.5) 
			{
				moveTimeCounter = Time.time;
	            currentWaypoint++;
	        } 
	        else if(Time.time - moveTimeCounter > moveTimeout)
	        {
		    	currentWaypoint = path.vectorPath.length;
		    }
		    else
		    {
				MoveTowards();
		    }
        }
        else
        {
        	yield StartCoroutine("StopForSeconds", 1.0);
        	
			currentWaypoint = 0;
			waypointPosition = curWayPoint.transform.position;
			seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
        }
		
		yield;
	}
}

function Retreat()
{
	currentWaypoint = 0;
	objectiveWaypoint.numOfUnits--;
	FindRetreatWaypoint();
	curWayPoint = objectiveWaypoint;
	waypointPosition = curWayPoint.transform.position;
	seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
	
	while(!(currentWaypoint >= path.vectorPath.length 
	|| Vector2.Distance(Vector2(waypointPosition.x,waypointPosition.z), Vector2(transform.position.x,transform.position.z)) < pickNextWaypointDistance + 1))
	{
		MoveTowards();
		
		if(currentWaypoint < path.vectorPath.length)
		{
			if (Vector2.Distance(Vector2(transform.position.x, transform.position.z), Vector2(path.vectorPath[currentWaypoint].x, path.vectorPath[currentWaypoint].z)) < 2.5) 
			{
				moveTimeCounter = Time.time;
	            currentWaypoint++;
	        }
			else if(Time.time - moveTimeCounter > moveTimeout)
	        {
				break;
		    }
		}
		
		yield;
	}
	fear = 0;
}

function FindRetreatWaypoint()
{
	var connectedLength : int = objectiveWaypoint.connected.Count;
	if(connectedLength != 0)
	{  
		var tempWaypoint : AutoWayPoint;
		var finalWaypoint : AutoWayPoint;
		var closestDistance = 10000;
		var myTeam = GetComponent(TeamNumber).team;
		//var ranNum : int = Random.Range(0,connectedLength);
		for(var i = 0; i < connectedLength; i++)
		{  
			tempWaypoint = objectiveWaypoint.connected[i];
			if(tempWaypoint.isBase) 
			{
				objectiveWaypoint = tempWaypoint;
				Debug.Log(objectiveWaypoint.isBase);
				break;
			}
		}
	}
	return objectiveWaypoint;
}

static function StrikeFear(pos : Vector3, f : int, myTeam : int, range : float)
{
	for(var i=0; i<enemyList.Count; i++)
	{
		if(enemyList[i].GetComponent(TeamNumber).team == myTeam
		&& Vector3.Distance(enemyList[i].transform.position, pos) < range)
		{
			enemyList[i].GetComponent(AI).fear += f;
		}
	}
}

function UpdateWaypointPosition()
{
	while(isFollowing)
	{
		if(waypointPosition != curWayPoint.transform.position)
		{
			waypointPosition = curWayPoint.transform.position;
			seeker.StartPath(transform.position,waypointPosition,OnPathComplete);
			currentWaypoint = 0;
		}
		yield WaitForSeconds(1);
	}
} 

function findIndex(awp : AutoWayPoint) : int
{
	for (var i = 0; i < completedObjectives.Count; i++) {
        if (completedObjectives[i] == awp) {
            return i;
        }
    }
    return -1;
}

function DisableAI(disable : boolean)
{
	disableAI = disable;
}

function IdleAI()
{
	while(disableAI)
	{
		yield WaitForSeconds(5);
	}
}

function SetIsLocal(local : boolean)
{
	isLocal = local;
}

function SetNetworkHit(hit : Vector3)
{
	networkHit = hit;
}

function SetCrouching(crouch : boolean)
{
	crounching = crouch;
}