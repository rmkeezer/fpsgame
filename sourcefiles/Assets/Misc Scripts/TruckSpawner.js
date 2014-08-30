#pragma strict

var unitObjective : AutoWayPoint;
var waypointContainer : GameObject;
var defaultCamera : GameObject;
var backCamera : GameObject;
var truckType : String;

function Start () {
	if(/*PlayerPrefs.GetInt("IsMultiplayer") == 1 &&*/ PhotonNetwork.isMasterClient)
	{
		var truck : GameObject = PhotonNetwork.InstantiateSceneObject(truckType, transform.position, transform.rotation, 0, null);
		var ccs : CarControlScript = truck.GetComponent(CarControlScript);
		ccs.unitObjective = unitObjective;
		ccs.waypointContainer = waypointContainer;
		ccs.defaultCamera = defaultCamera;
		ccs.backCamera = backCamera;
		ccs.frontCamera.active = false;
	}
}