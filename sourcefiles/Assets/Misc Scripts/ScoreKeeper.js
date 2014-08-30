#pragma strict

var scoreTexts : List.<GUIText>;
var scores : int[];
var unitList : List.<GameObject>;
var usaReinforcementTimer : GUIText;
var germanyReinforcementTimer : GUIText;
var usaTiming : float;
var germanyTiming : float;

function Start () 
{
	unitList = new List.<GameObject>();
	StartCounting();
	StartTimer(usaTiming, usaReinforcementTimer, "usaTimerEvent");
	StartTimer(germanyTiming, germanyReinforcementTimer, "germanTimerEvent");
}

function StartCounting()
{
	while(true)
	{
		scores = new int[scoreTexts.Count];
		
		unitList = new List.<GameObject>(GameObject.FindGameObjectsWithTag("Enemy"));
		for(var i=0; i<unitList.Count; i++)
		{
			if(unitList[i].GetComponent(CharacterController).enabled)
				scores[unitList[i].GetComponent(TeamNumber).team]++;
		}
		for(var j=0; j<scoreTexts.Count; j++)
		{
			scoreTexts[j].text = TeamNumber.teamName[j] + " : " + scores[j];
		}
		
		yield WaitForSeconds(1);
	}
}

function StartTimer(time : float, timer : GUIText, event : String)
{
	while(time > 0)
	{
		if(time%60 < 10)
			timer.text = "Reinforcements: " + Mathf.Floor(time/60) + ":0" + Mathf.Floor(time%60);
		else
			timer.text = "Reinforcements: " + Mathf.Floor(time/60) + ":" + Mathf.Floor(time%60);
		time -= Time.deltaTime;
		yield;
	}
	StartCoroutine(event);
}

function usaTimerEvent()
{
	Debug.Log("American Reinforcements have arrived");
}

function germanTimerEvent()
{
	Debug.Log("German Reinforcements have arrived");
}