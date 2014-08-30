#pragma strict

function Start () {
	GameObject.Find("trenches").transform.GetChild(1).gameObject.SetActiveRecursively(true);
	GameObject.Find("trenches").transform.GetChild(3).gameObject.SetActiveRecursively(true);
	GameObject.Find("trenches").transform.GetChild(6).gameObject.SetActiveRecursively(true);
	var players : GameObject[] = GameObject.FindGameObjectsWithTag("Player");
	for(var i=0; i<players.length; i++)
	{
		players[i].SendMessage("SetIsControl", true);
	}
}