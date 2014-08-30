var hitPoints = 100.0;
var deadReplacement : Transform;
var dieSound : AudioSource;
var bloodSplatter : GameObject;

function ApplyDamage (damage : float) {
	// We already have less than 0 hitpoints, maybe we got killed already?
	if (hitPoints <= 0.0)
		return;

	hitPoints -= damage;
	if (hitPoints <= 0.0)
	{
		if(GetComponent(AI).isLocal)
			SendMessage("NetworkDead", true);
		if(PhotonNetwork.isMasterClient)
			Detonate();
	}
}

function Detonate () {
	// Play a dying audio clip
	if (dieSound && GetComponent(AI).isNear && AI.numOfSounds < AI.maxNumOfSounds)
	{
		AI.numOfSounds++;
		AudioSource.PlayClipAtPoint(dieSound.clip,transform.position);
	}
	
	if(GetComponent(AI).isFollowing)
	{
		GameObject.FindWithTag("Player").GetComponentInChildren(AutoWayPoint).unitList.Remove(gameObject);
		GameObject.FindWithTag("Player").GetComponentInChildren(AutoWayPoint).numOfUnits--;
	}
	
	if(GetComponent(AI).isStepping)
		AI.numOfSteps--;
	
	if(GetComponent(MachineGunEnemy).wasPlaying)
		MachineGunEnemy.numOfShots--;
	
	// Disable ourselves
	AI.enemyList.Remove(gameObject);
	for(var j = 0; j<transform.GetChildCount(); j++)
		transform.GetChild(j).gameObject.SetActiveRecursively(false);
	GetComponent(CharacterController).enabled = false;
	GetComponent(PushableController).enabled = false;
	SendMessage("EnableAnim", false);
	SendMessage("DisableAI", true);
	
	// Replace ourselves with the dead body
	if (deadReplacement && PhotonNetwork.isMasterClient) 
	{
		AI.StrikeFear(transform.position, 100, GetComponent(TeamNumber).team, 15.0);
		
		var dead : Transform;
		if(PlayerPrefs.GetInt("IsMultiplayer") == 1)
			dead = PhotonNetwork.InstantiateSceneObject(deadReplacement.name, transform.position, transform.rotation, 0, null).transform;
		else
			dead = Instantiate(deadReplacement, transform.position, transform.rotation);
		
		dead.GetComponent(IsMan).FirstName = GetComponent(IsMan).FirstName;
		dead.GetComponent(IsMan).MiddleName = GetComponent(IsMan).MiddleName;
		dead.GetComponent(IsMan).LastName = GetComponent(IsMan).LastName;
		dead.GetComponent(IsMan).Age = GetComponent(IsMan).Age;
		dead.GetComponent(IsMan).Experience = GetComponent(IsMan).Experience;
		dead.GetComponent(IsMan).UpdateRank();
		dead.GetComponent(IsMan).ChangeHeight(GetComponent(IsMan).Height);
		dead.GetComponent(IsMan).Weight = GetComponent(IsMan).Weight;
		
		dead.SendMessage("NetworkName", GetComponent(IsMan).FirstName + " " + GetComponent(IsMan).MiddleName + " " + GetComponent(IsMan).LastName);
		dead.SendMessage("NetworkAge", GetComponent(IsMan).Age);
		dead.SendMessage("NetworkXP", GetComponent(IsMan).Experience);
		dead.GetComponent(IsMan).UpdateRank();
		dead.SendMessage("NetworkHeight", GetComponent(IsMan).Height);
		dead.SendMessage("NetworkWeight", GetComponent(IsMan).Weight);
		
		// Copy position & rotation from the old hierarchy into the dead replacement
		CopyTransformsRecurse(transform, dead);
	}
	
	if(bloodSplatter)
	{
		for(var i=0; i<3; i++)
		{
			var hit : RaycastHit;
			var layerMask = (1 << 0) | (1 << 13);
			if(Physics.Raycast(transform.position, Vector3.down+Vector3(Random.Range(-0.25,0.25),0,Random.Range(-0.25,0.25)), hit, 10, layerMask))
			{ 
				var bloodSplatter : GameObject = Instantiate(bloodSplatter, hit.point+(hit.normal*0.1), Quaternion.FromToRotation(Vector3.up, hit.normal));
				bloodSplatter.transform.localScale = Vector3(Random.Range(0.5,1.5),1,Random.Range(0.5,1.5));
			}
		}
	}
	
	AI.numOfSounds--;
}

static function CopyTransformsRecurse (src : Transform,  dst : Transform) {
	dst.position = src.position;
	dst.rotation = src.rotation;
	
	for (var child : Transform in dst) {
		// Match the transform with the same name
		var curSrc = src.Find(child.name);
		if (curSrc)
			CopyTransformsRecurse(curSrc, child);
	}
}