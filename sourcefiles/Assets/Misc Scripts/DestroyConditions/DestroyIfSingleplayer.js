#pragma strict

function Start () 
{
	if(PlayerPrefs.GetInt("IsMultiplayer") == 0)
		Destroy(gameObject);
}