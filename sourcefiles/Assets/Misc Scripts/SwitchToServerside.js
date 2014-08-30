#pragma strict

var objectName : String;

function Update () {
	if(PhotonNetwork.isMasterClient)
	{
		var tempObject : GameObject = PhotonNetwork.InstantiateSceneObject(objectName, transform.position, transform.rotation, 0, null);
		tempObject.GetComponent(SwitchToServerside).enabled = false;
		tempObject.GetComponent(AI).objectiveWaypoint = GetComponent(AI).objectiveWaypoint;
		Destroy(gameObject);
	}
}