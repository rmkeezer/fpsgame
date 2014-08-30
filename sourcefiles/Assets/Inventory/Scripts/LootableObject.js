//	LootableObject.js
//	Make the GameObject "Lootable".
//	This script will 
//	Attach this script to any GameObject that is "Lootable"

#pragma strict

public var contentArray : List.<InventoryItem>;										//	The current contents of this lootable object
private var thisLootableItem : LootableObject;									//	A reference to this instance of this script
private var clicked : boolean = false;													//	Trap for creating the current contents only once
private var lootTable : LootTable;												//	A reference to LootTable.js which creates the lootable content
private var lootWindowOpen : boolean;											//	Boolean to control TestDistance.
private var playerTransform : Transform;										//	A reference to the Player Transform
private var playerObject : GameObject;
private var thisTransform : Transform;
public var intContent : int[];
public var intStackContent : int[];


function Start () 
{																//	Setup the initial states of the variables
	thisTransform = this.transform;
	if(GameObject.Find("Player"))
		playerTransform = GameObject.FindWithTag("Player").transform; 
	thisLootableItem = this;
	//clicked = false;
	
	contentArray = new List.<InventoryItem>();
	
	lootTable = FindObjectOfType (LootTable);									//	Create a reference to the Loot Table
	if (!lootTable)
		Debug.Log ("InventoryLootableItem.Start(): No link to LootTable");
}

function Loot () 
{
	if (!clicked) {
		clicked = true;
		contentArray = lootTable.NewLootContent (thisLootableItem);
		/*for(var i=0; i<contentArray.Count; i++)
			if(contentArray[i])
				Debug.Log(contentArray[i].itemName);*/
		if(PlayerPrefs.GetInt("IsMultiplayer") == 1) {
			intContent = new int[contentArray.Count];
			intStackContent = new int[contentArray.Count];
			for(var i=0; i<contentArray.Count; i++) {
				for(var j=0; j<LootTable.lootArray.Count; j++) {
					if(LootTable.lootArray[j].itemName == contentArray[i].itemName) {
						intContent[i] = j;
						intStackContent[i] = contentArray[i].stackSize;
					}
				}
			}
		}
	}
	
	/*for(i=0; i<contentArray.Count; i++)
		if(contentArray[i])
			Debug.Log(contentArray[i].itemName);*/
	Inventory.statInventory.OpenLootWindow (thisLootableItem, contentArray);	//	Open Loot window
	lootWindowOpen = true;
	TestDistance ();
}

function UpdateContentArray (newContentArray : List.<InventoryItem>)	
{				//	A function to receive an updated array from Inventory.js
	contentArray = newContentArray;
	var newArray : List.<InventoryItem> = new List.<InventoryItem>();
	for(var i=0; i<contentArray.Count; i++)
		if(contentArray[i] != null)
			newArray.Add(contentArray[i]);
	
	
	if(PlayerPrefs.GetInt("IsMultiplayer") == 1) {
		intContent = new int[newArray.Count];
		intStackContent = new int[newArray.Count];
		for(i=0; i<newArray.Count; i++) {
			for(var j=0; j<LootTable.lootArray.Count; j++) {
				if(LootTable.lootArray[j].itemName == newArray[i].itemName) {
					intContent[i] = j;
					intStackContent[i] = newArray[i].stackSize;
				}
			}
		}
		//SendMessage("NetworkLoot", intContent);
		/*for(i=0; i<newArray.Count; i++)
			if(newArray[i])
				Debug.Log(newArray[i].itemName);*/
		playerObject.SendMessage("NetworkReverseLootObject", gameObject.name);
		playerObject.SendMessage("NetworkReverseLootStack", intStackContent);
		playerObject.SendMessage("NetworkReverseLoot", intContent);
	}
	
}

function UpdateNetworkStackContent(stackContent : int[])
{
	intStackContent = stackContent;
}

function UpdateNetworkInventory(newContent : int[])
{
	var newArray : List.<InventoryItem> = new List.<InventoryItem>();
	for(var i=0; i<newContent.Length; i++) {
		newArray.Add(LootTable.lootArray[newContent[i]]);
		newArray[i].stackSize = intStackContent[i];
		/*if(newArray[i])
			Debug.Log(newArray[i].itemName);*/
	}
	contentArray = newArray;
	clicked = true;
}

function LootWindowClosed ()
{													// A setter to set the lootWindowOpen to closed and stop TestDistance
	lootWindowOpen = false;
}

function TestDistance () {
	while (lootWindowOpen && playerTransform) {
		var distanceToPlayer : float = Vector3.Distance(playerTransform.position, thisTransform.position);
		if (distanceToPlayer > 5.0) {
			Debug.Log ("Player has left the building!");
			Inventory.statInventory.LootableObjectOutofRange ();
			lootWindowOpen = false;
		}
		yield WaitForSeconds (1);
	}
	return;
}

function SetPlayerTransform(thePlayer : GameObject)
{
	playerObject = thePlayer;
}
