#pragma strict

import System.Collections.Generic;

var defaultCamera : GameObject;
var backCamera : GameObject;
var frontCamera : GameObject;
var comOffCenterY : float = -0.9;
var comOffCenterZ : float = -0.5;
var wheelFL : WheelCollider;
var wheelFR : WheelCollider;
var wheelML : WheelCollider;
var wheelMR : WheelCollider;
var wheelBL : WheelCollider;
var wheelBR : WheelCollider;
var wheelFLTrans : Transform;
var wheelFRTrans : Transform;
var wheelMLTrans : Transform;
var wheelMRTrans : Transform;
var wheelBLTrans : Transform;
var wheelBRTrans : Transform;
var lowestSteerAtSpeed : float = 50;
var lowSpeedSteerAngle : float = 45;
var highSpeedSteerAngle : float = 5;
var decellerationSpeed : float = 30;
var maxTorque : float = 50;
var currentSpeed : float = 150;
var topSpeed : float = 150;
var maxReverseSpeed : float = 50;
// Brake Light not used yet
/*var backLightObject : GameObject;
var idleLightMaterial : Material;
var brakeLightMaterial : Material;
var reverseLightMaterial : Material;*/
private var braked : boolean = false;
var maxBrakeTorque : float = 100;
private var mySidewayFriction : float;
private var myForwardFriction : float;
private var mySidewaySlip : float;
private var myForwardSlip : float;
var gearRatio : int[];
var engineSound : AudioSource;

@HideInInspector
var playerControlled : boolean = false;
var computerControlled : boolean = true;
var thePlayer : GameObject;

var driverExit : GameObject;
var backExit : GameObject;

// AI Variables
var inputSteer : float = 0.0;
var inputTorque : float = 0.0;

var waypointContainer : GameObject;
private var waypoints : List.<Transform>;
var currentWaypoint : int = 0;

var steeringSharpness : float = 12.0;

var BrakePower : float = 0;


// other
var isNear : boolean = false;

var exitMask : int;

var passengers : List.<GameObject>;
var backSeats : List.<Transform>;

var tempUnit : GameObject;

var fillWithUnit : boolean;

var unitObjective : AutoWayPoint;

function Start () 
{
	thePlayer = GameObject.FindWithTag("Player");
	passengers = new List.<GameObject>();
	exitMask = (1 << 0);
	rigidbody.centerOfMass.y = comOffCenterY;
	rigidbody.centerOfMass.z = comOffCenterZ;
	SetValues();
	GetWaypoints();
	TrackPlayerPosition();
	
}

function SetValues()
{
	myForwardFriction = wheelBR.forwardFriction.stiffness;
	mySidewayFriction = wheelBR.sidewaysFriction.stiffness;
	myForwardSlip = 0.01;
	mySidewaySlip = 0.01;
}

function FixedUpdate () 
{
	if(playerControlled)
	{
		frontCamera.active = true;
		Control();
		HandBrake();
	} 
	else if(computerControlled)
	{
		frontCamera.active = false;
		NavigateTowardsWaypoint();
		AIControl();
	}
}

function Update()
{
	if(fillWithUnit && PhotonNetwork.isMasterClient) {
		for(var z=0; z<3; z++)
		{
			var newUnit : GameObject;
			if(PlayerPrefs.GetInt("IsMultiplayer") == 1)
				newUnit = PhotonNetwork.InstantiateSceneObject(tempUnit.name, backSeats[z].position, backSeats[z].rotation, 0, null);
			else
				newUnit = Instantiate(tempUnit);
			newUnit.GetComponent(AI).objectiveWaypoint = unitObjective;
			LoadPassenger(newUnit);
		}
		fillWithUnit = false;
	}
	if(isNear)
	{
		wheelFLTrans.Rotate(wheelFL.rpm/60*360*Time.deltaTime,0,0);
		wheelFRTrans.Rotate(wheelFR.rpm/60*360*Time.deltaTime,0,0);
		wheelMLTrans.Rotate(wheelML.rpm/60*360*Time.deltaTime,0,0);
		wheelMRTrans.Rotate(wheelMR.rpm/60*360*Time.deltaTime,0,0);
		wheelBLTrans.Rotate(wheelBL.rpm/60*360*Time.deltaTime,0,0);
		wheelBRTrans.Rotate(wheelBR.rpm/60*360*Time.deltaTime,0,0);
		wheelFLTrans.localEulerAngles.y = wheelFL.steerAngle - wheelFLTrans.localEulerAngles.z;
		wheelFRTrans.localEulerAngles.y = wheelFR.steerAngle - wheelFRTrans.localEulerAngles.z;
		WheelPosition();
		EngineSound();
	}
	for(var i=0; i<passengers.Count; i++) {
		passengers[i].transform.position = backSeats[i].position;
	}
	if(playerControlled)
	{
		if(Input.GetKeyDown("c"))
		{
			if(backCamera.active) {
				frontCamera.active = true;
				backCamera.active = false;
			} else {
				frontCamera.active = false;
				backCamera.active = true;
			}
		}
		if(!thePlayer)
			thePlayer = GameObject.FindWithTag("Player");
		thePlayer.transform.position = GetComponent(IsVehicle).driverSeat.position;
		if(Input.GetKeyDown("e"))
		{
			frontCamera.active = false;
			backCamera.active = false;
			var raycastPos : Vector3 = driverExit.transform.position;
			raycastPos.y += 50.0;
			var hit : RaycastHit;
			if(Physics.Raycast(raycastPos,Vector3(0,-1,0),hit,50.0,exitMask)) {
				hit.point.y += 2.5;
				thePlayer.transform.position = hit.point;
			} else {
 				thePlayer.transform.position = driverExit.transform.position;
 			}
			thePlayer.GetComponent(CharacterController).enabled = true;
			thePlayer.SendMessage("NetworkCollision",true);
			thePlayer.SendMessage("SetIsControl",true);
			thePlayer.transform.FindChild("Animator").gameObject.SetActiveRecursively(false);
			thePlayer.transform.FindChild("MainCameraController").FindChild("MainCamera").gameObject.SetActiveRecursively(true);
			thePlayer.GetComponent(FPSPlayer).playerWeapons.GetComponent(PlayerWeapons).SelectWeapon(PlayerWeapons.NOGUN,true);
			thePlayer.GetComponent(FPSPlayer).playerWeapons.GetComponent(PlayerWeapons).UpdateCurrentGun();
			playerControlled = false;
		}
	}
}

// Brake Light not used yet
/*
function BackLight()
{
	if(currentSpeed > 0 && Input.GetAxis("Vertical") < 0 && !braked) {
		backLightObject.renderer.material = brakeLightMaterial;
	} else if(currentSpeed < 0 && Input.GetAxis("Vertical") > 0 && !braked) {
		backLightObject.renderer.material = brakeLightMaterial;
	} else if(currentSpeed < 0 && Input.GetAxis("Vertical") < 0 && !braked) {
		backLightObject.renderer.material = reverseLightMaterial;
	} else if(!braked) {
		backLightObject.renderer.material = idleLightMaterial;
	}
}
*/

function WheelPosition()
{
	var hit : RaycastHit;
	var wheelPos : Vector3;
	// Front Left
	if(Physics.Raycast(wheelFL.transform.position, -wheelFL.transform.up, 
	hit, wheelFL.radius+wheelFL.suspensionDistance) )
	{
		wheelPos = hit.point + wheelFL.transform.up * wheelFL.radius;
	} else {
		wheelPos = wheelFL.transform.position - wheelFL.transform.up * wheelFL.suspensionDistance;
	}
	wheelFLTrans.position = wheelPos;
	// Front Right
	if(Physics.Raycast(wheelFR.transform.position, -wheelFR.transform.up, 
	hit, wheelFR.radius+wheelFR.suspensionDistance) )
	{
		wheelPos = hit.point + wheelFR.transform.up * wheelFR.radius;
	} else {
		wheelPos = wheelFR.transform.position - wheelFR.transform.up * wheelFR.suspensionDistance;
	}
	wheelFRTrans.position = wheelPos;
	// Middle Left
	if(Physics.Raycast(wheelML.transform.position, -wheelML.transform.up, 
	hit, wheelML.radius+wheelML.suspensionDistance) )
	{
		wheelPos = hit.point + wheelML.transform.up * wheelML.radius;
	} else {
		wheelPos = wheelML.transform.position - wheelML.transform.up * wheelML.suspensionDistance;
	}
	wheelMLTrans.position = wheelPos;
	// Middle Right
	if(Physics.Raycast(wheelMR.transform.position, -wheelMR.transform.up, 
	hit, wheelMR.radius+wheelMR.suspensionDistance) )
	{
		wheelPos = hit.point + wheelMR.transform.up * wheelMR.radius;
	} else {
		wheelPos = wheelMR.transform.position - wheelMR.transform.up * wheelMR.suspensionDistance;
	}
	wheelMRTrans.position = wheelPos;
	// Back Left
	if(Physics.Raycast(wheelBL.transform.position, -wheelBL.transform.up, 
	hit, wheelBL.radius+wheelBL.suspensionDistance) )
	{
		wheelPos = hit.point + wheelBL.transform.up * wheelBL.radius;
	} else {
		wheelPos = wheelBL.transform.position - wheelBL.transform.up * wheelBL.suspensionDistance;
	}
	wheelBLTrans.position = wheelPos;
	// Back Right
	if(Physics.Raycast(wheelBR.transform.position, -wheelBR.transform.up, 
	hit, wheelBR.radius+wheelBR.suspensionDistance) )
	{
		wheelPos = hit.point + wheelBR.transform.up * wheelBR.radius;
	} else {
		wheelPos = wheelBR.transform.position - wheelBR.transform.up * wheelBR.suspensionDistance;
	}
	wheelBRTrans.position = wheelPos;
	
}

function Control()
{
	currentSpeed = 2*Mathf.PI*wheelBL.radius*wheelBL.rpm*60/1000;
	currentSpeed = Mathf.Round(currentSpeed);
	if(currentSpeed < topSpeed && currentSpeed > -maxReverseSpeed && !braked) {
		wheelBR.motorTorque = maxTorque * Input.GetAxis("Vertical");
		wheelBL.motorTorque = maxTorque * Input.GetAxis("Vertical");
		wheelMR.motorTorque = maxTorque * Input.GetAxis("Vertical");
		wheelML.motorTorque = maxTorque * Input.GetAxis("Vertical");
	} else {
		wheelBR.motorTorque = 0;
		wheelBL.motorTorque = 0;
		wheelMR.motorTorque = 0;
		wheelML.motorTorque = 0;
	}
	
	if(Input.GetButton("Vertical") == false) {
		wheelMR.brakeTorque = decellerationSpeed;
		wheelML.brakeTorque = decellerationSpeed;
		wheelBR.brakeTorque = decellerationSpeed;
		wheelBL.brakeTorque = decellerationSpeed;
	} else {
		wheelMR.brakeTorque = 0;
		wheelML.brakeTorque = 0;
		wheelBR.brakeTorque = 0;
		wheelBL.brakeTorque = 0;
	}
	var speedFactor = rigidbody.velocity.magnitude/lowestSteerAtSpeed;
	var currentSteerAngle = Mathf.Lerp(lowSpeedSteerAngle,highSpeedSteerAngle,speedFactor);
	currentSteerAngle *= Input.GetAxis("Horizontal");
	wheelFL.steerAngle = currentSteerAngle;
	wheelFR.steerAngle = currentSteerAngle;
}

function HandBrake()
{
	if(Input.GetButton("Jump")) {
		braked = true;
	} else {
		braked = false;
	}
	if(braked) {
		wheelFR.brakeTorque = maxBrakeTorque;
		wheelFL.brakeTorque = maxBrakeTorque;
		//wheelMR.brakeTorque = maxBrakeTorque;
		//wheelML.brakeTorque = maxBrakeTorque;
		wheelBR.motorTorque = 0;
		wheelBL.motorTorque = 0;
		wheelMR.motorTorque = 0;
		wheelML.motorTorque = 0;
		if(rigidbody.velocity.magnitude > 1) {
			SetSlip(myForwardSlip, mySidewaySlip);
		} else {
			SetSlip(1, 1);
		}
		// Brake Light not used yet
		/*
		if(currentSpeed < 1 && currentSpeed > -1) {
			backLightObject.renderer.material = idleLightMaterial;
		} else {
			backLightObject.renderer.material = brakeLightMaterial;
		}
		*/
	} else {
		wheelFR.brakeTorque = 0;
		wheelFL.brakeTorque = 0;
		SetSlip(myForwardFriction, mySidewayFriction);
	}
}

function SetSlip(currentForwardFriction : float, currentSidewayFriction : float)
{
	wheelBR.forwardFriction.stiffness = currentForwardFriction;
	wheelBL.forwardFriction.stiffness = currentForwardFriction;
	wheelMR.forwardFriction.stiffness = currentForwardFriction;
	wheelML.forwardFriction.stiffness = currentForwardFriction;
	
	wheelBR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelBL.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelMR.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelML.sidewaysFriction.stiffness = currentSidewayFriction;
}

function EngineSound()
{
	for(var i = 0; i < gearRatio.length; i++) {
		if(gearRatio[i] > currentSpeed || i >= gearRatio.length-1) {
			break;
		}
	}
	var gearMinValue : float = 0.00;
	var gearMaxValue : float = 0.00;
	if(i == 0)
		gearMinValue = 0;
	else
		gearMinValue = gearRatio[i-1];
	gearMaxValue = gearRatio[i];
	var enginePitch : float = ((Mathf.Abs(currentSpeed) - gearMinValue)/(gearMaxValue - gearMinValue)/3)+0.5;
	engineSound.pitch = enginePitch;
}

function AIControl()
{
	currentSpeed = 2*Mathf.PI*wheelBL.radius*wheelBL.rpm*60/1000;
	currentSpeed = Mathf.Round(currentSpeed);
	if(currentSpeed < topSpeed && currentSpeed > -maxReverseSpeed && !braked) {
		wheelFR.motorTorque = maxTorque * inputTorque * 4;
		wheelFL.motorTorque = maxTorque * inputTorque * 4;
	} else {
		wheelFR.motorTorque = 0;
		wheelFL.motorTorque = 0;
	}
	wheelML.brakeTorque = BrakePower;
	wheelMR.brakeTorque = BrakePower;
	wheelBL.brakeTorque = BrakePower;
	wheelBR.brakeTorque = BrakePower;
	wheelFL.steerAngle = (steeringSharpness) * inputSteer;
	wheelFR.steerAngle = (steeringSharpness) * inputSteer;
}

function GetWaypoints ()
{
	// Now, this function basically takes the container object for the waypoints, then finds all of the transforms in it,
	// once it has the transforms, it checks to make sure it's not the container, and adds them to the array of waypoints.
	var potentialWaypoints : List.<Component> = new List.<Component>(waypointContainer.GetComponentsInChildren( Transform ));
	waypoints = new List.<Transform>();
	
	for ( var potentialWaypoint : Transform in potentialWaypoints ) {
		if ( potentialWaypoint != waypointContainer.transform ) {
			waypoints.Add(potentialWaypoint);
		}
	}
}

function NavigateTowardsWaypoint () 
{
	// now we just find the relative position of the waypoint from the car transform,
	// that way we can determine how far to the left and right the waypoint is.
	var RelativeWaypointPosition : Vector3 = transform.InverseTransformPoint( Vector3( 
												waypoints[currentWaypoint].position.x, 
												transform.position.y, 
												waypoints[currentWaypoint].position.z ) );
																				
																				
	// by dividing the horizontal position by the magnitude, we get a decimal percentage of the turn angle that we can use to drive the wheels
	inputSteer = RelativeWaypointPosition.x / RelativeWaypointPosition.magnitude;
	
	// now we do the same for torque, but make sure that it doesn't apply any engine torque when going around a sharp turn...
	if ( Mathf.Abs( inputSteer ) < 0.5 ) {
		inputTorque = Mathf.Abs(RelativeWaypointPosition.z / RelativeWaypointPosition.magnitude - Mathf.Abs( inputSteer ));
	} else {
		inputTorque = 0.5;
	}
	
	// this just checks if the car's position is near enough to a waypoint to count as passing it, if it is, then change the target waypoint to the
	// next in the list.
	if ( RelativeWaypointPosition.magnitude < 20 ) {
		currentWaypoint ++;
		
		if ( currentWaypoint >= waypoints.Count ) {
			currentWaypoint = 0;
		}
	}
	
}

function TrackPlayerPosition()
{
	while(true)
	{
		if(!thePlayer)
			thePlayer = GameObject.FindWithTag("Player");
		if(Vector3.Distance(thePlayer.transform.position, transform.position) < 30.0) {
			isNear = true;
			if(!engineSound.isPlaying)
				engineSound.Play();
		} else {
			isNear = false;
		}
		yield WaitForSeconds(1);
	}
}

function StopAcceleration()
{
	wheelFR.motorTorque = 0;
	wheelFL.motorTorque = 0;
	wheelBR.motorTorque = 0;
	wheelBL.motorTorque = 0;
	wheelMR.motorTorque = 0;
	wheelML.motorTorque = 0;
}

function Unload()
{
	var spawnMask : int = (1 << 0);
	var raycastPos = backExit.transform.position;
	raycastPos.y += 45;
	var passengerCount = passengers.Count;
	for(var i=0; i<passengerCount; i++) {
		var hit : RaycastHit;
		if(Physics.Raycast(raycastPos,Vector3(0,-1,0),hit,50,spawnMask)) {
			hit.point.y += 2.5;
			passengers[0].transform.position = hit.point;
		} else {
			var tempHeight = backExit.transform.position;
			tempHeight.y += 2.5;
			passengers[0].transform.position = tempHeight;
		}
		passengers[0].SetActiveRecursively(true);
		passengers[0].GetComponent(CharacterController).enabled = true;
		passengers[0].SendMessage("DisableAI",false);
		passengers.RemoveAt(0);
		yield WaitForSeconds(1);
	}
}

function LoadPassenger(passenger : GameObject)
{
	if(passengers.Count >= backSeats.Count)
		return;
	passengers.Add(passenger);
	passenger.GetComponent(CharacterController).enabled = false;
	passenger.SendMessage("DisableAI",true);
}