#pragma strict

var mainObject : GameObject;

function Start()
{
	if(mainObject.GetComponent(FPSPlayer).isControllable)
		gameObject.SetActiveRecursively(false);
}

function OnEnable()
{
	if(mainObject.GetComponent(FPSPlayer).isControllable)
		gameObject.SetActiveRecursively(false);
}