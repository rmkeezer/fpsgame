#pragma strict
import System.Collections.Generic;


var multiplayerModels : List.<GameObject>;
var localModels : List.<GameObject>;
var multiMuzzleFlash : GameObject;
var singleMuzzleFlash : GameObject;

function MultiplayerModels()
{
	DeactivateLocalModels(false);
	DeactivateMultiplayerModels(true);
	MultiplayerMuzzleFlash(true);
}

function LocalModels()
{
	DeactivateMultiplayerModels(false);
	DeactivateLocalModels(true);
	MultiplayerMuzzleFlash(false);
}

function DeactivateMultiplayerModels(isActive : boolean)
{
	for(var obj : GameObject in multiplayerModels)
	{
		obj.SetActiveRecursively(isActive);
	}
}

function DeactivateLocalModels(isActive : boolean)
{
	for(var obj : GameObject in localModels)
	{
		obj.SetActiveRecursively(isActive);
	}
}

function MultiplayerMuzzleFlash(isActive : boolean)
{
	if(isActive) {
		singleMuzzleFlash.active = false;
		GetComponent(MachineGun).muzzleFlash = multiMuzzleFlash.renderer;
	} else {
		multiMuzzleFlash.active = false;
		GetComponent(MachineGun).muzzleFlash = singleMuzzleFlash.renderer;	
	}
}