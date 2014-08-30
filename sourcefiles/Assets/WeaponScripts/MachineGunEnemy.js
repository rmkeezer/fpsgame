#pragma strict

static var numOfShots = 0;
static var maxNumOfShots = 10;

var range = 100.0;
var fireRate = 0.05;
var force = 10.0;
var damage = 5.0;
var bulletsPerClip = 40;
var ammo = 90;
var reloadTime = 0.5;
var bulletWidth = 10;
var bulletHeight = 50;
var swayRate : float = 1;
var recoilRate = 3;
var accuracy = 0.15;
var bulletHoleSize = 0.1;
private var scaledAccuracy = accuracy;
private var verticalAccuracy = scaledAccuracy/2;

var hitMetalParticles : ParticleEmitter;
var hitDirtParticles : ParticleEmitter;
var hitDirtParticles2 : ParticleEmitter;
var hitWoodParticles : ParticleEmitter;
var hitManParticles : ParticleEmitter;
var smokeParticles : ParticleEmitter;
var bulletHoleMetal : Material;
var bulletHoleDirt : Material;
var bulletHoleWood : Material;
var bulletHoleMan : Material;
var muzzleFlash : Renderer;

var swayFactor : Vector3;
var walkSway1 : Vector3;
var walkSway2 : Vector3;
var curVect : Vector3;
var startPosition : Vector3;

var splat : GameObject;

private var bulletsLeft : int = 0;
private var nextFireTime = 0.0;
private var m_LastFrameShot = -1;

private var swayTarget = 1;

@HideInInspector
var reloading : boolean = false;

private var startRotationY = 0;
private var startRotationX = 0;
private var startRotationZ = 0;
private var startRotY : float;
private var endRotY : float;
private var currentRotY : float;
private var startRotX : float;
private var endRotX : float;
private var currentRotX : float;

@HideInInspector
static var bulletHoleMetalObject : GameObject;
@HideInInspector
static var bulletHoleDirtObject : GameObject;
@HideInInspector
static var bulletHoleWoodObject : GameObject;
@HideInInspector
static var bulletHoleManObject : GameObject;
@HideInInspector
static var makeHoles : int = 0;

var fireSound : AudioSource;
var reloadSound : AudioSource;

var bulletTrail : LineRenderer;

var dirtImpact : AudioClip;
var manImpact : AudioClip;
var whizSound : AudioClip;
@HideInInspector
var isNear : boolean = false;
@HideInInspector
var thePlayer : Transform;
private var shotNear : boolean = false;
@HideInInspector
var wasPlaying : boolean = false;
private var didPlay : boolean = false;

private var myTeam : int;

function Start () {

	ammo = 10000;

	if(GameObject.FindWithTag("Player"))
		thePlayer = GameObject.FindWithTag("Player").transform;

	startRotationY = transform.localRotation.y;
	startRotationX = transform.localRotation.x;
	startRotationZ = transform.localRotation.z;
	startRotY = startRotationY;
	endRotY = startRotY+15;
	currentRotY = startRotY;
	startRotX = startRotationX;
	endRotX = startRotX+15;
	currentRotX = startRotX;
	
	startPosition = transform.localPosition;
	defineSwayPoints();
	if(smokeParticles)
		smokeParticles.emit = false;
	if(hitMetalParticles)
		hitMetalParticles.emit = false;
	if(hitDirtParticles)
		hitDirtParticles.emit = false;
	if(hitDirtParticles2)
		hitDirtParticles2.emit = false;
	if(hitWoodParticles)
		hitWoodParticles.emit = false;
	if(hitManParticles)
		hitManParticles.emit = false;
	bulletsLeft = bulletsPerClip;
	
	// create quad for bullethole metal
	if(makeHoles == 0)
	{
		 var mr : MeshRenderer = new MeshRenderer();
		 var m : Mesh = new Mesh();
	     m.name = "Scripted_Plane_New_Mesh";
	     m.vertices = [Vector3(-bulletHoleSize, -bulletHoleSize, 0.01), Vector3(bulletHoleSize, -bulletHoleSize, 0.01), Vector3(bulletHoleSize, bulletHoleSize, 0.01), Vector3(-bulletHoleSize, bulletHoleSize, 0.01) ];
	     m.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];
	     m.triangles = [0, 1, 2, 0, 2, 3];
	     m.RecalculateNormals();
	     if(bulletHoleMetal)
	     {
		     bulletHoleMetalObject = new GameObject("bulletHoleMetalMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleMetalObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleMetalObject.renderer.material = bulletHoleMetal;
	     }
	     
	     // create quad for bullethole dirt
	     if(bulletHoleDirt)
	     {
		     bulletHoleDirtObject = new GameObject("bulletHoleDirtMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleDirtObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleDirtObject.renderer.material = bulletHoleDirt;
		 }
	     
	     // create quad for bullethole wood
	     if(bulletHoleWood)
	     {
		     bulletHoleWoodObject = new GameObject("bulletHoleWoodMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleWoodObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleWoodObject.renderer.material = bulletHoleWood;
	     }
	     
	     // create quad for bullethole wood
	     if(bulletHoleMan)
	     {
		     bulletHoleManObject = new GameObject("bulletHoleWoodMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleManObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleManObject.renderer.material = bulletHoleMan;
	     }
	     makeHoles = 1;
     }
     
	myTeam = thePlayer.GetComponent(TeamNumber).team;
}


function LateUpdate () {
	if(muzzleFlash)
	{
		if(!fireSound.isPlaying)
		{
			if(wasPlaying)
			{
				numOfShots--;
				wasPlaying = false;
			}
		} 
		if(m_LastFrameShot == Time.frameCount)
		{
			muzzleFlash.transform.localRotation =
				Quaternion.AngleAxis(Random.Range(0, 359), Vector3.forward);
			muzzleFlash.enabled = true;
			muzzleFlash.light.enabled = true;
			
			if(fireSound && isNear && numOfShots < maxNumOfShots)
			{
				if(!fireSound.isPlaying)
				{
					numOfShots++;
					fireSound.Play();
					wasPlaying = true;
				} 
				else if(fireSound.clip.length < 1.3) 
				{
					if(wasPlaying) {
						numOfShots--;
					}
					numOfShots++;
					fireSound.PlayOneShot(audio.clip);
					wasPlaying = true;
				}
				fireSound.loop = true;
			}
		}
		else
		{
			muzzleFlash.enabled = false;
			muzzleFlash.light.enabled = false;
			enabled = false;
			
			if(fireSound)
			{
				fireSound.loop = false;
			}
		}
	}
}

function Fire()
{
	if(bulletsLeft == 0)
		return;
		
	if (nextFireTime <= Time.time && bulletsLeft > 0){
		var direction = transform.forward;
		var hit : RaycastHit;
		var layerMask = (1 << 0) | (1 << 11) | (1 << 13) | (1 << 14) | (1 << 25);
		if(Physics.Raycast(transform.position, Vector3(direction.x+Random.Range(-scaledAccuracy,scaledAccuracy),direction.y+Random.Range(-verticalAccuracy,verticalAccuracy),direction.z), hit, range, layerMask)) {
    		if(hit.transform.parent && hit.transform.parent.GetComponent(TeamNumber)) {
    			if(hit.transform.parent.GetComponent(TeamNumber).team != myTeam) {
    				FireOneShot(direction, hit, layerMask);
    			}
    		} else {
    			FireOneShot(direction, hit, layerMask);
    		}
    			
    	} else {
    		if(bulletTrail)
    		{
				bulletTrail.SetPosition(0, muzzleFlash.transform.position);
				bulletTrail.SetPosition(1, transform.position+(Vector3(direction.x+Random.Range(-scaledAccuracy,scaledAccuracy),direction.y+Random.Range(-verticalAccuracy,verticalAccuracy),direction.z)*range));
				bulletTrail.SetWidth(0.1,0.1);
				Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
    		}
    		if(GetComponent(AI).isLocal) {
				SendMessage("NetworkFire", true, SendMessageOptions.DontRequireReceiver);
				SendMessage("NetworkHit", transform.position+(Vector3(direction.x+Random.Range(-scaledAccuracy,scaledAccuracy),direction.y+Random.Range(-verticalAccuracy,verticalAccuracy),direction.z)*range), SendMessageOptions.DontRequireReceiver);
			}
    	}
		bulletsLeft--;
		currentRotX -= recoilRate;
		m_LastFrameShot = Time.frameCount;
		enabled = true;
		if(bulletsLeft == 0)
			Reload();	
    		
    	nextFireTime = Time.time + fireRate;
  	}
}

function Fire(networkHit : Vector3)
{
	if(bulletsLeft == 0)
		return;
		
	if (bulletsLeft > 0){
		var direction = transform.forward;
		var hit : RaycastHit;
		var layerMask = (1 << 0) | (1 << 11) | (1 << 13) | (1 << 14) | (1 << 25);
		if(Physics.Raycast(transform.position, (transform.position-networkHit).normalized, hit, range, layerMask)) {
    		//if(hit.transform.GetComponent(TeamNumber) && GetComponent(TeamNumber))
    			//if(hit.transform.GetComponent(TeamNumber).team != GetComponent(TeamNumber).team)
    				FireOneShot(direction, hit, layerMask);
    	} else {
    		if(bulletTrail)
    		{
				bulletTrail.SetPosition(0, muzzleFlash.transform.position);
				bulletTrail.SetPosition(1, networkHit);
				bulletTrail.SetWidth(0.1,0.1);
				Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
    		}
    	}
		bulletsLeft--;
		enabled = true;
		if(bulletsLeft == 0)
			Reload();	
  	}
}

function FireOneShot(direction : Vector3, hit : RaycastHit, layerMask : int)
{
	//var direction = transform.forward;
	//var hit : RaycastHit;
	//var layerMask = (1 << 0) | (1 << 8) | (1 << 9) | (1 << 13);
	
	//if(Physics.Raycast(transform.position, direction, hit, range, layerMask))
	//{
	if(myTeam == 0)
		AI.StrikeFear(hit.point, damage, 1, 3.0); 
	else
		AI.StrikeFear(hit.point, damage, 0, 3.0); 
		
	
	if(GetComponent(AI).isLocal) {
		SendMessage("NetworkFire", true, SendMessageOptions.DontRequireReceiver);
		SendMessage("NetworkHit", hit.point, SendMessageOptions.DontRequireReceiver);
	}
	
	if(bulletTrail)
	{
		bulletTrail.SetPosition(0, muzzleFlash.transform.position);
		bulletTrail.SetPosition(1, hit.point);
		bulletTrail.SetWidth(0.1,0.1);
		Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
	}
	
	if(hit.rigidbody)
		hit.rigidbody.AddForceAtPosition(force * direction, hit.point);
		
	if(thePlayer && Vector3.Distance(thePlayer.position, hit.point) < 15.0)
	{	
		shotNear = true;
	} else {
		shotNear = false;
	}
	
	if(shotNear && whizSound)
	{
		if(AI.numOfSounds < AI.maxNumOfSounds) {
			AI.numOfSounds++;
			audio.PlayClipAtPoint(whizSound, hit.point * (Vector3.Dot(hit.point, thePlayer.position)/Vector3.Dot(hit.point, hit.point)), 1);
			SoundCounter(whizSound.length);
		}
	}
	
	if(hitMetalParticles)
	{
		if(hit.transform.GetComponent(IsMetal))
		{
			if(shotNear) {
				hitMetalParticles.transform.position = hit.point;
				hitMetalParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitMetalParticles.Emit();
			}
			if(bulletHoleMetal && !hit.transform.GetComponent(Rigidbody))
			     Instantiate(bulletHoleMetalObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
		}
	}
	if(hitDirtParticles && hitDirtParticles2)
	{
		if(hit.transform.GetComponent(IsGround))
		{
			if(shotNear) {
				if(AI.numOfSounds < AI.maxNumOfSounds) {
					AI.numOfSounds++;
					audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
					SoundCounter(dirtImpact.length);
				}
				hitDirtParticles.transform.position = hit.point;
				hitDirtParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles.Emit();
				hitDirtParticles2.transform.position = hit.point;
				hitDirtParticles2.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles2.Emit();
			}
			if(bulletHoleDirt)
			     Instantiate(bulletHoleDirtObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
		}
	}
	if(hitWoodParticles)
	{
		if(hit.transform.GetComponent(IsWood))
		{
			if(shotNear && AI.numOfSounds < AI.maxNumOfSounds) {
				if(AI.numOfSounds < AI.maxNumOfSounds) {
					AI.numOfSounds++;
					audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
					SoundCounter(dirtImpact.length);
				}
				hitWoodParticles.transform.position = hit.point;
				hitWoodParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitWoodParticles.Emit();
			}
			if(bulletHoleWood && bulletHoleWoodObject)
			     Instantiate(bulletHoleWoodObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
		}
	}
	if(hitManParticles)
	{
		if(!hit.transform.GetComponent(IsMetal) && (hit.transform.GetComponent(IsMan) || hit.transform.root.GetComponent(IsMan)))
		{
			if(shotNear && AI.numOfSounds < AI.maxNumOfSounds) {
				if(AI.numOfSounds < AI.maxNumOfSounds) {
					AI.numOfSounds++;
					audio.PlayClipAtPoint(manImpact, hit.point, 1);
					SoundCounter(manImpact.length);
				}
				hitManParticles.transform.position = hit.point;
				hitManParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitManParticles.Emit();
			}
			if(bulletHoleMan)
			     Instantiate(bulletHoleManObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			var hitMan : RaycastHit;
			var layerMaskMan = (1 << 0) | (1 << 13);
			if(Physics.Raycast(transform.position, Vector3(direction.x+Random.Range(-scaledAccuracy,scaledAccuracy),direction.y+Random.Range(-verticalAccuracy,verticalAccuracy),direction.z), hitMan, range, layerMaskMan))
			{
				var bloodSplatter : GameObject = Instantiate(splat, hitMan.point + (hitMan.normal*0.1), Quaternion.FromToRotation(Vector3.up, hitMan.normal));
				bloodSplatter.transform.localScale = Vector3(Random.Range(0.3,1.0),1,Random.Range(0.3,1.0));
			}
		}
	}
	
	if(!hit.transform.GetComponent(IsMetal) && hit.transform.GetComponent(IsMan))
	{
		GetComponent(IsMan).Experience += damage;
		SendMessage("NetworkXP", GetComponent(IsMan).Experience);
		GetComponent(IsMan).UpdateRank();
	}
	
	if(smokeParticles && isNear)
	{
		smokeParticles.Emit();
	}
	
	if(hit.transform.GetComponent(IsMan))
	{
		if(hit.transform.parent.GetComponent(AI))
		{
			hit.transform.parent.GetComponent(CharacterDamage).ApplyDamage(damage);
		} else {
			hit.transform.parent.GetComponent(FPSPlayer).ApplyDamage(damage);
		}
	}
	
	//}
	
	/*bulletsLeft--;
	
	currentRotX -= recoilRate;
	
	m_LastFrameShot = Time.frameCount;
	enabled = true;
	
	if(bulletsLeft == 0)
		Reload();*/
}

function Reload()
{
	reloading = true;
	if(reloadSound && isNear && AI.numOfSounds < AI.maxNumOfSounds) {	
		AI.numOfSounds++;
		didPlay = true;
		reloadSound.Play();
	}
	yield WaitForSeconds(reloadTime);
	if(didPlay) {
		AI.numOfSounds--;
		didPlay = false;
	}
	
	reloading = false;
	
	if(ammo >= bulletsPerClip)
	{
		bulletsLeft = bulletsPerClip;
		ammo -= bulletsPerClip;
	}
	else if(ammo > 0)
	{
		bulletsLeft = bulletsPerClip;
		ammo = 0;
	}
}

function GetBulletsLeft()
{
	return bulletsLeft;
}
function GetAmmoLeft()
{
	return ammo;
}
function GetClipSize()
{
	return bulletsPerClip;
}
function GetBulletWidth()
{
	return bulletWidth;
}
function GetBulletHeight()
{
	return bulletHeight;
}

// everything below is part of walksway //
function walkSway () 
{
    if(swayTarget == 1)
    {    
            //swayTarget is which of the two points I'm going towards
         if (Vector3.Distance(transform.localPosition, walkSway1) >= 0.08){
            curVect = walkSway1 - transform.localPosition;
                     //if the gun isn't at sway point one, transform towards it (the speed at which it transforms depends on the speed of the player) .
            transform.Translate(curVect*Time.deltaTime*swayRate,Space.Self);
        } else {
                    //if it has reached sway point 1, start going towards sway point 2
            swayTarget = 2;
        }
    } else if(swayTarget == 2) {
        if (Vector3.Distance(transform.localPosition, walkSway2) >= 0.08){
            curVect = walkSway2 - transform.localPosition;
                            // curVect is just the temporary vector for the translation
            transform.Translate(curVect*Time.deltaTime*swayRate,Space.Self);
        } else {
            swayTarget = 1;
        }
    }
}

function lookSway(mouseSpeedX : float, mouseSpeedY : float)
{
	currentRotY -= mouseSpeedX/50;
	currentRotY = Mathf.Clamp(currentRotY,startRotY-endRotY,endRotY);
	currentRotX += mouseSpeedY/50;
	currentRotX = Mathf.Clamp(currentRotX,startRotX-endRotX,endRotX);
	transform.localRotation = Quaternion.Euler(currentRotX,currentRotY,startRotationZ);
}

function defineSwayPoints () 
{
	swayFactor = new Vector3(0.1,0,0);
    walkSway1 = transform.localPosition + swayFactor;
    walkSway2 = transform.localPosition - swayFactor;
}

function resetPosition () 
{
     if (transform.localPosition != startPosition)
     {
        curVect= startPosition - transform.localPosition;
        transform.Translate(curVect*Time.deltaTime*2,Space.Self);
     }
}

function resetRotation()
{
	currentRotY = (currentRotY - startRotationY)/1.1;
	currentRotX = (currentRotX - startRotationX)/1.1;
	transform.localRotation = Quaternion.Euler(currentRotX,currentRotY,startRotationZ);
}

function SoundCounter(seconds : float)
{
	yield WaitForSeconds(seconds*5);
	AI.numOfSounds--;
}