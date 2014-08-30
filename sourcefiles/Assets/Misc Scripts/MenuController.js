#pragma strict

var isSingleplayerButton = false;
var isMultiplayerButton = false;
var isOptionsButton = false;
var isQuitButton = false;

function Start()
{
	Screen.showCursor = true;
	renderer.material.color = Color.grey;
}

function OnMouseEnter()
{
	renderer.material.color = Color.white;
}

function OnMouseExit()
{
	renderer.material.color = Color.grey;
}

function OnMouseUp()
{
	if(isSingleplayerButton)
	{
		PlayerPrefs.SetInt("IsMultiplayer",0);
		Application.LoadLevel("trenches");
	}
	else if(isMultiplayerButton)
	{
		PlayerPrefs.SetInt("IsMultiplayer",1);
		Application.LoadLevel("trenches");
	}
	else if(isOptionsButton)
	{
		GetComponent(TextMesh).text = "Not Implemented";
	}
	else if(isQuitButton)
	{
		Application.Quit();
	}
}