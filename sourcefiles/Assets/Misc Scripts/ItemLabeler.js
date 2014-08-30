#pragma strict

private var drawIcon : boolean;
private var drawText : String;
private var drawText2 : String;
private var drawText3 : String;
private var drawText4 : String;
private var drawText5 : String;
private var squadText : String;
private var squadText2 : String;
private var squadText3 : String;
private var squadText4 : String;
private var itemCode : int;

var crosshairTexture : Texture2D;
private var iconPosition : Rect;
private var labelPosition : Rect;
private var labelPosition2 : Rect;
private var labelPosition3 : Rect;
private var labelPosition4 : Rect;
private var labelPosition5 : Rect;
private var squadLabelPosition : Rect;
private var squadLabelPosition2 : Rect;
private var squadLabelPosition3 : Rect;
private var squadLabelPosition4 : Rect;
private var centeredStyle : GUIStyle;

var pickupSound : AudioClip;

var waypoint : GameObject;
private var autoWaypoint : AutoWayPoint;

var thePlayer : GameObject;

private var layerMask : int;
private var hit : RaycastHit;

function Start () {
	layerMask = (1 << 8) | (1 << 11) | (1 << 12) | (1 << 14) | (1 << 25);
	autoWaypoint = waypoint.GetComponent(AutoWayPoint);
	drawIcon = false;
	drawText = "";
	drawText2 = "";
	drawText3 = "";
	drawText4 = "";
	drawText5 = "";
	iconPosition = Rect((Screen.width - (crosshairTexture.width/10))/2,
		(Screen.height - (crosshairTexture.height/10))/2,
		crosshairTexture.width/10, crosshairTexture.height/10);
	labelPosition =  Rect(0,
		(Screen.height - (crosshairTexture.height/10))/2+30,
		Screen.width, 50);
	labelPosition2 =  Rect(0,
		(Screen.height - (crosshairTexture.height/10))/2+45,
		Screen.width, 50);
	labelPosition3 =  Rect(0,
		(Screen.height - (crosshairTexture.height/10))/2+60,
		Screen.width, 50);
	labelPosition4 =  Rect(0,
		(Screen.height - (crosshairTexture.height/10))/2+75,
		Screen.width, 50);
	labelPosition5 =  Rect(0,
		(Screen.height - (crosshairTexture.height/10))/2+90,
		Screen.width, 50);
	squadText = "";
	squadText2 = "";
	squadText3 = "";
	squadText4 = "";
	squadLabelPosition = Rect(10, Screen.height-160, 100, 80);
	squadLabelPosition2 = Rect(10, Screen.height-240, 100, 80);
	squadLabelPosition3 = Rect(10, Screen.height-320, 100, 80);
	squadLabelPosition4 = Rect(10, Screen.height-400, 100, 80);
}

function OnGUI() {
	centeredStyle = GUI.skin.GetStyle("Label");
    centeredStyle.alignment = TextAnchor.UpperCenter;
	GUI.Label(labelPosition, drawText, centeredStyle);
	GUI.Label(labelPosition2, drawText2, centeredStyle);
	GUI.Label(labelPosition3, drawText3, centeredStyle);
	GUI.Label(labelPosition4, drawText4, centeredStyle);
	GUI.Label(labelPosition5, drawText5, centeredStyle);
	GUI.Label(squadLabelPosition, squadText, centeredStyle);
	GUI.Label(squadLabelPosition2, squadText2, centeredStyle);
	GUI.Label(squadLabelPosition3, squadText3, centeredStyle);
	GUI.Label(squadLabelPosition4, squadText4, centeredStyle);
	if(drawIcon)
	{
		GUI.DrawTexture(iconPosition, crosshairTexture);
	}
	
}

function Update () {
	if (Physics.Raycast(transform.position, transform.forward, hit, 3.0, layerMask)){
		if (hit.transform != null)
		{
		  if(hit.transform.GetComponent(IsVehicle))
		  {
		  	drawIcon = true;
			var tempString = hit.transform.GetComponent(IsVehicle).vehicleName;
			drawText = "(E) Enter " + tempString;
			drawText2 = "";
			drawText3 = "";
			drawText4 = "";
			drawText5 = "";
			if (Input.GetButtonDown("PickupItem") && !GameManager.isPaused)  // the "E" key
			{
				hit.transform.GetComponent(CarControlScript).defaultCamera.active = true;
				hit.transform.GetComponent(CarControlScript).defaultCamera.GetComponent(CarCameraScript).car = hit.transform;
				hit.transform.GetComponent(CarControlScript).playerControlled = true;
				hit.transform.GetComponent(CarControlScript).computerControlled = false;
				hit.transform.GetComponent(CarControlScript).StopAcceleration();
				if(hit.transform.GetComponent(IsVehicle).enterSound)
					AudioSource.PlayClipAtPoint(hit.transform.GetComponent(IsVehicle).enterSound, transform.position);
				thePlayer.GetComponent(CharacterController).enabled = false;
				thePlayer.SendMessage("NetworkCollision",false);
				thePlayer.SendMessage("SetIsControl",false);
				thePlayer.transform.FindChild("Animator").gameObject.SetActiveRecursively(true);
				gameObject.SetActiveRecursively(false);
			}
		  } 
		  else if(hit.transform.GetComponent(IsItem))
		  {
		  	drawIcon = true;
		  	drawText = hit.transform.GetComponent(IsItem).ItemName;
			drawText2 = "";
			drawText3 = "";
			drawText4 = "";
			drawText5 = "";
			if (Input.GetButtonDown("PickupItem") && !GameManager.isPaused)  // the "E" key
			{
				var tempItemIndex : int = hit.transform.GetComponent(IsItem).ItemCode;
		      	var tempItem : InventoryItem = LootTable.lootArray[tempItemIndex];
		      	if(tempItem) {
		      		if(tempItem.ammoCapacity != 0) {
		      			for(var i=0; i<LootTable.lootArray.Count; i++) {
		      				if(LootTable.lootArray[i].itemName == tempItem.ammoType) {
		      					tempItem = LootTable.lootArray[i];
		      					tempItem.stackSize = Random.Range(0, tempItem.maxStack);
		      					GameObject.Find("InventoryManager").GetComponent(Inventory).AddItem(tempItem);
			      			}
			      		}	
			      		if(pickupSound)
							AudioSource.PlayClipAtPoint(pickupSound, transform.position);
						thePlayer.SendMessage("NetworkDestroyItem", hit.collider.transform.parent.name);
						Destroy(hit.collider.gameObject);
					} else if(GameObject.Find("InventoryManager").GetComponent(Inventory).AddItem(tempItem)) {
						if(pickupSound)
							AudioSource.PlayClipAtPoint(pickupSound, transform.position);
						//itemCode = hit.collider.transform.GetComponent(IsItem).ItemCode;
						//transform.GetChild(1).GetChild(itemCode).GetComponent(MachineGun).ammo += transform.GetChild(1).GetChild(itemCode).GetComponent(MachineGun).bulletsPerClip;
						thePlayer.SendMessage("NetworkDestroyItem", hit.collider.transform.parent.name);
						Destroy(hit.collider.gameObject);
					}
				}
			}
		  }
		  else if(!hit.transform.GetComponent(IsMetal) && hit.transform.GetComponent(IsMan))
		  {
		  	var tempObject : Transform;
		  	if(hit.transform.parent)
		    	tempObject = hit.transform.parent;
		    else
		    	tempObject = hit.transform;
		    	
		  	drawIcon = false;
		  	drawText = (tempObject.GetComponent(IsMan).Rank + " "
		  				/*"Name: " + tempObject.GetComponent(IsMan).FirstName + " "
		  				+ tempObject.GetComponent(IsMan).MiddleName + " "*/
		  				+ tempObject.GetComponent(IsMan).LastName);
		  	drawText2 = tempObject.GetComponent(IsMan).Experience + "/" + (((tempObject.GetComponent(IsMan).Experience/1000)*1000)+1000);
		  	/*drawText2 = ("Age: " + tempObject.GetComponent(IsMan).Age);
		  	drawText3 = ("Nationality: " + tempObject.GetComponent(IsMan).Nationality);
		  	drawText4 = ("Height: " + tempObject.GetComponent(IsMan).HeightFeet + "ft " +
		  	tempObject.GetComponent(IsMan).HeightInches + "in");
		  	drawText5 = ("Weight: " + tempObject.GetComponent(IsMan).Weight);*/
		  	if(tempObject.GetComponent(AI) && !tempObject.GetComponent(AI).isFollowing)
		  	{
		      	drawText3 = "(E) Add to squad";
		      	if(Input.GetButtonUp("PickupItem") && !GameManager.isPaused)
		      	{
		      		if(autoWaypoint.numOfUnits < autoWaypoint.maxNumOfUnits-1)
		      		{
		      			tempObject.GetComponent(AI).savedObjectiveWaypoint = tempObject.GetComponent(AI).objectiveWaypoint;
		          		tempObject.GetComponent(AI).objectiveWaypoint = autoWaypoint;
		          		tempObject.GetComponent(AI).curWayPoint = autoWaypoint;
		          		tempObject.GetComponent(AI).isFollowing = true;
		          		autoWaypoint.unitList.Add(hit.transform.gameObject);
		          		if(autoWaypoint.numOfUnits == 0) {
		          			squadText = "adsfasdfasdfasdfasdfadasfasdfa";
		          		} else if(autoWaypoint.numOfUnits == 1) {
		          			squadText2 = "asdfasdfasdfasdfasdfasdfad";
		          		} else if(autoWaypoint.numOfUnits == 2) {
		          			squadText3 = "asdfasdfasdfasd";
		          		} else if(autoWaypoint.numOfUnits == 3) {
		          			squadText4 = "asdfasdfasdfasdfasdfa";
		          		}
		          		autoWaypoint.numOfUnits++;
		      		}
		      	}
		    } else {
		    	drawText3 = "Following you";
		    	if(Input.GetButtonUp("PickupItem") && !GameManager.isPaused)
		      	{
		      		tempObject.GetComponent(AI).objectiveWaypoint = tempObject.GetComponent(AI).savedObjectiveWaypoint;
		      		tempObject.GetComponent(AI).curWayPoint = tempObject.GetComponent(AI).objectiveWaypoint;
		      		tempObject.GetComponent(AI).isFollowing = false;
		      		if(autoWaypoint.findIndex(tempObject.gameObject) == 0) {
		      			squadText = "";
		      		} else if(autoWaypoint.findIndex(tempObject.gameObject) == 1) {
		      			squadText2 = "";
		      		} else if(autoWaypoint.findIndex(tempObject.gameObject) == 2) {
		      			squadText3 = "";
		      		} else if(autoWaypoint.findIndex(tempObject.gameObject) == 3) {
		      			squadText4 = "";
		      		}
		      		autoWaypoint.unitList.Remove(tempObject.gameObject);
		          	autoWaypoint.numOfUnits--;
		      	}
		    }
		  } 
		  else if(!hit.transform.GetComponent(IsMetal) && hit.transform.root.GetComponent(IsMan))
		  {
		  	drawIcon = true;
		  	drawText = (hit.transform.root.GetComponent(IsMan).Rank + " "
		  				/*"Name: " + hit.transform.root.GetComponent(IsMan).FirstName + " "
		  				+ hit.transform.root.GetComponent(IsMan).MiddleName + " "*/
		  				+ hit.transform.root.GetComponent(IsMan).LastName);
		  	/*drawText2 = ("Age: " + hit.transform.root.GetComponent(IsMan).Age);
		  	drawText3 = ("Nationality: " + hit.transform.root.GetComponent(IsMan).Nationality);
		  	drawText4 = ("Height: " + hit.transform.root.GetComponent(IsMan).HeightFeet + "ft " + 
		  	hit.transform.root.GetComponent(IsMan).HeightInches + "in");
		  	drawText5 = ("Weight: " + hit.transform.root.GetComponent(IsMan).Weight);*/
		  	if(Input.GetButtonUp("PickupItem") && !GameManager.isPaused)
		  	{
		  		hit.transform.root.GetComponent(LootableObject).SetPlayerTransform(thePlayer);
		  		hit.transform.root.GetComponent(LootableObject).Loot();
		  		thePlayer.SendMessage("NetworkReverseLootObject", hit.transform.root.name);
		  		thePlayer.SendMessage("NetworkReverseLoot", hit.transform.root.GetComponent(LootableObject).intContent);
		  		GameObject.Find("_GameManager").GetComponent(GameManager).TogglePause();
		  	}
		  }
		}
	} else {
		drawIcon = false;
		drawText = "";
		drawText2 = "";
		drawText3 = "";
		drawText4 = "";
		drawText5 = "";
	}
	
}
