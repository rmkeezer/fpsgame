#pragma strict

var brakingPower : float = 20;
var enginePower : float = 20;
var unitObjective : AutoWayPoint;
var zoneLayer : int;
private var spawnMask : int;

function Start() {
	spawnMask = (1 << 0);
}

function OnTriggerEnter (other : Collider) 
{
	/*if(other.transform.GetComponent(CarControlScript) && other.transform.GetComponent(CarControlScript).computerControlled)
	{
		other.transform.GetComponent(CarControlScript).BrakePower = brakingPower;
		var tempTorque : float = other.transform.GetComponent(CarControlScript).maxTorque;
		other.transform.GetComponent(CarControlScript).maxTorque = enginePower;
		yield WaitForSeconds(5);
		other.transform.GetComponent(CarControlScript).BrakePower = 0;
		other.transform.GetComponent(CarControlScript).maxTorque = tempTorque;
	}*/
	if(other.transform.GetComponent(Spawner) && other.transform.GetComponent(Spawner).zoneLayer == zoneLayer 
	&& other.transform.parent.parent.transform.GetComponent(CarControlScript).computerControlled)
	{
		var tempCarScript = other.transform.parent.parent.transform.GetComponent(CarControlScript);
		tempCarScript.BrakePower = brakingPower;
		var tempTorque2 : float = tempCarScript.maxTorque;
		tempCarScript.maxTorque = enginePower;
		yield WaitForSeconds(2);
		yield tempCarScript.StartCoroutine("Unload");
		tempCarScript.BrakePower = 0;
		tempCarScript.maxTorque = tempTorque2;
	}
}