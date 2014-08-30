#pragma strict

function Start () 
{
	if(PlayerPrefs.GetInt("IsMultiplayer") == 1)
		Destroy(gameObject);
}