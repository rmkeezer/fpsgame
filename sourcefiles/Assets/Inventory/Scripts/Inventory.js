//	Inventory.js
//	This script manages the inventory and displays the inventory items in a grid pattern
//	Attach to your Inventory Manager Object
//	Based on the code posted by Der Dude on the Unity3D forums: http://forum.unity3d.com/viewtopic.php?t=11865

// aaand now also heavily edited by me. Matthew.

static var statInventory : Inventory;										//	To set an instance of this script
enum SlotType 	{Primary, Secondary, Hat, Shirt, Gloves, Pants, Shoes, Backpack, Accessory, Grenade, Knife, Ammo, Empty, PlaceHolder}
static var slotWidths = new Array(4, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1);
static var slotHeights = new Array(1, 2, 1, 2, 1, 3, 1, 3, 1, 1, 2, 1);

var windowSkin : GUISkin;

//	HELPER CLASSES
@System.Serializable														//	Our Representation of an InventoryItem
class InventoryItem {
	var itemName : String;													//	What the item will be called in the inventory
	var itemIcon : Texture;													//	What the item will look like in the inventory
	var slotType : SlotType;												//	What slot the item will fit in
	var width : int;
	var height : int;
	var position : int;
	var description : String;
	var weaponCode : int;
	var maxStack : int;
	var stackSize : int;
	var ammoType : String;
	var ammoCapacity : int;
}

@System.Serializable														//	Our Representation of an Equipment Slot
class EquipmentSlot {
	var slotName : String;
    var slotRect : Rect; 
    var slotIcon : Texture2D;
    var slotType : SlotType; 
}

public var inventory : InventoryItem[];										//	Our master inventory (private)
public var equipped : InventoryItem[];										//	Our equipped inventory
var equippedSlot : EquipmentSlot[];											//	Our list to keep track of out Equipment Slots
private var contentArray : List.<InventoryItem>;									//	The array to contain the loot being passed to and from the LootableObject
private var placeHolder : InventoryItem;									//  Placeholder Item


var inventoryWidth : int;													//	the number of columns to display the inventory in
var inventoryLength : int;													//	the size of the inventory in total number of slots

var iconWidthHeight : int;													//	The pixel size (height and width) of an inventory slot
var spacing : int;															//	Space between slots (in x and y)
var offSet : Vector2;														//	The start position of the inventory

var emptySlot : Texture;													//	This will be drawn when a slot is empty

private var openInventoryWindow : boolean;										//	Controls OnGUI and opens/closes the inventory window
private var openLootWindow : boolean;										//	Controls OnGUI and opens/closes the loot window
private var openCharacterWindow : boolean;									//	Controls OnGUI and opens/closes the Character window
private var openInfoWindow : boolean;									//	Controls OnGUI and opens/closes the info window

private var inventoryWindow : Rect;											//	The dimensions of the inventory window
private var lootWindow : Rect;												//	The dimensions of the loot window
private var characterWindow : Rect;											//	The dimensions of the Character window
private var infoWindow : Rect;											//	The dimensions of the info window

private var infoItem : InventoryItem;

private var currentLootableItem : LootableObject;							//	The pointer to the current lootable item being processed
private var newLootableItem : LootableObject;								//	The pointer to a new lootable item to be processed

private var dragging = false;
private var currentDraggable : Rect;
private var currentDraggableItem : InventoryItem;

var openInventorySound : AudioClip;
var pickupLoot : AudioClip;
var equipItem : AudioClip;
var unEquipItem : AudioClip;
var dropItem : AudioClip;

private var showList = true;
private var listEntry = 0;
private var list : GUIContent[];
private var listStyle : GUIStyle;
private var picked = false;
private var itemMenu = false;
private var mainMousePosx : int = 0;
private var mainMousePosy : int = 0;
private var lootMousePosx : int = 0;
private var lootMousePosy : int = 0;
private var itemMousePosx : int = 0;
private var itemMousePosy : int = 0;
private var charMousePosx : int = 0;
private var charMousePosy : int = 0;
private var infoMousePosx : int = 0;
private var infoMousePosy : int = 0;
private var mainGetPosOnce = false;
private var itemGetPosOnce = false;
private var charGetPosOnce = false;
private var lootGetPosOnce = false;
private var infoGetPosOnce = false;

private var mainCamera : GameObject;


function Awake () {															//	Setup the initial states of the variables
	statInventory = this;
	
	placeHolder = new InventoryItem();
	placeHolder.slotType = SlotType.PlaceHolder;
	
	inventoryWindow = ResizeGUI(Rect (320, 40, 302, 180));
	lootWindow = ResizeGUI(Rect (40, 40, 240, 230));
	characterWindow = ResizeGUI(Rect (30, 40, 240, 195));
	infoWindow = ResizeGUI(Rect (320, 280, 240, 180));
	
	openInventoryWindow = false;
	openLootWindow = false;
	openCharacterWindow = false;
	openInfoWindow = false;
	
	currentLootableItem = null;
        
	inventory = new Array (inventoryLength);								//   Create & init the array to hold the inventory 
	for (var i : int = 0; i < inventory.length; i++) { 
		inventory[i] = null; 
	}

	equipped =  new Array (11);												//	Create & init the array to hold the equipped items
	for (var j : int = 0; j < equipped.length; j++) {
		equipped[j] = null;
	}

	for (var k : int = 0; k < equippedSlot.length; k++) {					//	Init the array for equipment slots, setting the size of the icon
		equippedSlot[k].slotRect.width = iconWidthHeight*slotWidths[k];
		equippedSlot[k].slotRect.height = iconWidthHeight*slotHeights[k];
	}
	
	// drop down menu for inventory
	
	// Make some content for the popup list
	list = new GUIContent[4];
	list[0] = new GUIContent("Examine");
	list[1] = new GUIContent("Equip");
	list[2] = new GUIContent("Drop");
	list[3] = new GUIContent("Cancel");
 
	// Make a GUIStyle that has a solid white hover/onHover background to indicate highlighted items
	listStyle = new GUIStyle();
	listStyle.normal.textColor = Color.white;
	var tex = new Texture2D(2, 2);
	var colors = new Color[4];
	for (color in colors) color = Color.white;
	tex.SetPixels(colors);
	tex.Apply();
	listStyle.hover.background = tex;
	listStyle.onHover.background = tex;
	listStyle.padding.left = listStyle.padding.right = listStyle.padding.top = listStyle.padding.bottom = 4;
	
	var tex2 = new Texture2D(2, 2);
	var colors2 = new Color[4];
	for (color in colors2) color = Color.grey;
	tex2.SetPixels(colors2);
	tex2.Apply();
	listStyle.normal.background = tex2;
	
	mainCamera = GameObject.Find("MainCamera");
	
	// Make a GUIStyle for the windows
	//listStyle = new GUIStyle();
	//listStyle.normal.textColor = Color.white;
}

function OnGUI () {
	if(windowSkin)
		GUI.skin = windowSkin;

	//	Loot Window
	if (openLootWindow) {													//   If the "open loot window" toggle is true
		lootWindow = GUI.Window (0, lootWindow, DrawLootWindow, "Loot");					//   The title of this window could be passed as a String from the LootableItem
	}

	//	Inventory Window
	if (openInventoryWindow) {													//   If the "open inventory window" toggle is true
		inventoryWindow = GUI.Window (1, inventoryWindow, DrawInventoryWindow, "Inventory");	//   The title of this window could be passed as a String from the LootableItem
		
	}
	
	//	Character Window
	if (openCharacterWindow) {
		characterWindow = GUI.Window (2, characterWindow, DrawCharacterWindow, "Character");	//	Set this to player.name, not "Character"
	} 
	
	//	Info Window
	if (openInfoWindow) {
		infoWindow = GUI.Window (3, infoWindow, DrawInfoWindow, "Info");
	} 
	
	if(dragging && !itemMenu)
	{
		currentDraggable.x = Event.current.mousePosition.x;
		currentDraggable.y = Event.current.mousePosition.y;
		GUI.DrawTexture(currentDraggable, currentDraggableItem.itemIcon);
	}
	
	if(itemMenu)
	{
		if(mainGetPosOnce)
		{
			mainMousePosx = Event.current.mousePosition.x;
			mainMousePosy = Event.current.mousePosition.y;
			mainGetPosOnce = false;
		}
		if (Popup.List (Rect(mainMousePosx, mainMousePosy, 100, 20), showList, listEntry, GUIContent(""), list, listStyle)) {
			//if(Rect(mainMousePosx, mainMousePosy, 100, 20).Contains(Input.mousePosition)) {
				picked = true;
			//}
		}
	}
	
	if(!mainCamera && GameObject.FindWithTag("Player"))
		mainCamera = GameObject.FindWithTag("Player").GetComponent(FPSPlayer).mainCamera;
	if(GameManager.isPaused && mainCamera && mainCamera.GetComponent(PauseMenu).currentPage == Page.None && !openInventoryWindow && !openCharacterWindow && !openInfoWindow && !openLootWindow) {
		mainCamera.GetComponent(PauseMenu).UnPauseGame();
	}
		
	
}


function DrawLootWindow () {												//	The window function to draw the loot window
	if (GUI.Button (ResizeGUI(Rect (8,6,10,10)), "")) {
		CloseLootWindow();
	}
	
	var startY : int = 20;
	for (var i : int = 0; i < contentArray.Count; i ++) {
		if (contentArray[i] != null) {
			if (GUI.Button (ResizeGUI(Rect (10, startY, 220, 30)), GUIContent ("     " + contentArray[i].stackSize + "x " + contentArray[i].itemName, contentArray[i].itemIcon))) {
				var success : boolean = AddItem(contentArray[i]);
				if(success) {
					audio.PlayOneShot(pickupLoot);
					contentArray[i] = null;
				} else {
					Debug.Log("Inventory Full");
				}
				currentLootableItem.UpdateContentArray(contentArray);
			}
			startY = startY + 35;
		}
	}
	
	if (GUI.Button (ResizeGUI(Rect (70, 195, 100, 30)), "Close"))
	{
		openLootWindow = false;
	}
	
	if(dragging && !itemMenu)
	{
		currentDraggable.x = Event.current.mousePosition.x;
		currentDraggable.y = Event.current.mousePosition.y;
		GUI.DrawTexture(currentDraggable, currentDraggableItem.itemIcon);
	}
	
	if(itemMenu)
	{
		if(lootGetPosOnce)
		{
			lootMousePosx = Event.current.mousePosition.x;
			lootMousePosy = Event.current.mousePosition.y;
			lootGetPosOnce = false;
		}
		if (Popup.List (Rect(lootMousePosx, lootMousePosy, 100, 20), showList, listEntry, GUIContent(""), list, listStyle)) {
			//if(Rect(lootMousePosx, lootMousePosy, 100, 20).Contains(Input.mousePosition)) {
				picked = true;
			//}
		}
	} else {
    	GUI.DragWindow (Rect (0,0,10000,20));
    }
}

function DrawInventoryWindow () {											//	The window function to draw the inventory window
	if (GUI.Button (ResizeGUI(Rect (8,6,10,10)), "")) {
		CloseInventoryWindow ();
	}
	
	var j : int;
	var k : int;
	var currentInventoryItem : InventoryItem;								//   Establish a variable to hold our data
	var currentRect : Rect;
	var currentDraggingItem : int = -1;
	
	if (picked) {
		if(list[listEntry].text.Equals("Equip")) {
			openLootWindow = false;
			openCharacterWindow = true;
			 var success2 : boolean = EquipItem (currentDraggableItem);
			 if (success2)
			 {
			 	var z = currentDraggableItem.position;
				for(var n2 : int = 0; n2 < currentDraggableItem.height; n2++) {
					for(var o2 : int = 0; o2 < currentDraggableItem.width; o2++) {
						inventory[z+o2+(n2*inventoryWidth)] = null;							//  add Placeholder for items bigger than 1x1
					}
				}
			 	inventory[z] = null;
			 	if(currentDraggableItem.slotType == SlotType.Primary || currentDraggableItem.slotType == SlotType.Secondary) {
			 		GameObject.Find("Weapons").GetComponent(PlayerWeapons).UpdateCurrentGun();
			 	}
			 }
		} else if(list[listEntry].text.Equals("Drop")) {
			var temp : InventoryItem = currentDraggableItem;
			for(var l : int = 0; l < temp.height; l++) {
				for(var m : int = 0; m < temp.width; m++) {
					inventory[currentDraggableItem.position+m+(l*inventoryWidth)] = null;							//  add Placeholder for items bigger than 1x1
				}
			}
			inventory[currentDraggableItem.position] = null;
		} else if(list[listEntry].text.Equals("Examine")) {
			infoItem = currentDraggableItem;
			openInfoWindow = true;
		}
		picked = false;
		itemMenu = false;
		showList = true;
	}
	
	for (var i : int = 0; i < inventory.length; i ++) {						//   Go through each row ...
		j = i / inventoryWidth;												//   ... divide by array by width to get rows...
		k = i % inventoryWidth;												//   ... find the remainder by width to get columns...
		currentInventoryItem = inventory[i];								//   ... set this point in the matrix as our current point ...
		if(currentInventoryItem != null && currentInventoryItem.slotType == SlotType.PlaceHolder)
			continue;
		currentRect = (ResizeGUI(Rect (offSet.x + k * (iconWidthHeight + spacing), offSet.y + j * (iconWidthHeight + spacing), iconWidthHeight, iconWidthHeight)));
		if (currentInventoryItem == null) {									//   ... if there is no item in the j-th row and the k-th column, draw a blank texture
			GUI.DrawTexture (currentRect, emptySlot);
		} else {
			currentRect.width *= currentInventoryItem.width;
			currentRect.height *= currentInventoryItem.height;
			GUI.DrawTexture (currentRect, currentInventoryItem.itemIcon);
			if(currentInventoryItem.stackSize > 1)
				GUI.Label(currentRect, currentInventoryItem.stackSize + "x");
		}
		
		//   If there is an item at this location and there is a button click...
		if (!itemMenu && 
		currentInventoryItem != null && GUI.RepeatButton (currentRect, "", GUIStyle ("label"))) {
			currentRect.x = Event.current.mousePosition.x - (currentRect.width/2);
			currentRect.y = Event.current.mousePosition.y - (currentRect.height/2);
			currentDraggable = currentRect;
			currentDraggableItem = currentInventoryItem;
			dragging = true;
			if(Input.GetMouseButton(1)) {
				dragging = false;
			}
			if (Input.GetMouseButtonUp (0)) {								
				 dragging = false;
			} else if (Input.GetMouseButtonUp (1)) {						
				listEntry = 3;
				mainGetPosOnce = true;
				itemGetPosOnce = true;
				charGetPosOnce = true;
				lootGetPosOnce = true;
				infoGetPosOnce = true;
				itemMenu = true;
				dragging = false;
			}
		}
	}
	
	if(dragging && !itemMenu)
	{
		currentDraggable.x = Event.current.mousePosition.x;
		currentDraggable.y = Event.current.mousePosition.y;
		GUI.DrawTexture(currentDraggable, currentDraggableItem.itemIcon);

		if (Input.GetMouseButtonUp (0)) {
			 for(var a=0; a<inventory.length; a++) {
				j = a / inventoryWidth;	
				k = a % inventoryWidth;	
			 	var continueOuterLoop = false;
			 	currentInventoryItem = inventory[a];
				if(currentInventoryItem != null)
					continue;
				if(a+currentDraggableItem.width > inventory.length 
				|| (a%inventoryWidth)+currentDraggableItem.width > inventoryWidth
				|| (((a%inventoryWidth)+currentDraggableItem.width > inventory.length%inventoryWidth) && (a/inventoryWidth)+currentDraggableItem.height > (inventory.length/inventoryWidth))
				|| (a/inventoryWidth)+currentDraggableItem.height-1 > (inventory.length/inventoryWidth))	{  // If the item + item width is too big, keep searching
					continueOuterLoop = true;
				}
				if(continueOuterLoop)
					continue;
				var tempItem : InventoryItem = currentDraggableItem;
				for(var v : int = 0; v < tempItem.height; v++) {
					for(var g : int = 0; g < tempItem.width; g++) {
						inventory[tempItem.position+g+(v*inventoryWidth)] = null;							//  add Placeholder for items bigger than 1x1
					}
				}
				inventory[tempItem.position] = null;
				for(var y : int = 0; y < currentDraggableItem.height && !continueOuterLoop; y++) {
					for(var q : int = 0; q < currentDraggableItem.width && !continueOuterLoop; q++) {
						if(inventory[a+q+(y*inventoryWidth)] != null) {
							continueOuterLoop = true;
						}
					}
				}
				for(var n : int = 0; n < tempItem.height; n++) {
					for(var o : int = 0; o < tempItem.width; o++) {
						inventory[tempItem.position+o+(n*inventoryWidth)] = placeHolder;							//  add Placeholder for items bigger than 1x1
					}
				}
				inventory[tempItem.position] = tempItem;
				if(continueOuterLoop)
					continue;
				currentRect = (ResizeGUI(Rect (offSet.x + k * (iconWidthHeight + spacing), offSet.y + j * (iconWidthHeight + spacing), iconWidthHeight, iconWidthHeight)));
				if(currentRect.Contains(Event.current.mousePosition))
				{
					tempItem = currentDraggableItem;
					for(v = 0; v < tempItem.height; v++) {
						for(g = 0; g < tempItem.width; g++) {
							inventory[tempItem.position+g+(v*inventoryWidth)] = null;							//  add Placeholder for items bigger than 1x1
						}
					}
					inventory[tempItem.position] = null;
					for(n = 0; n < tempItem.height; n++) {
						for(o = 0; o < tempItem.width; o++) {
							inventory[a+o+(n*inventoryWidth)] = placeHolder;							//  add Placeholder for items bigger than 1x1
						}
					}
					tempItem.position = a;
					inventory[a] = tempItem;
					break;
				}
			 }
			 dragging = false;
		}
	}
	
	if(itemMenu)
	{
		if(itemGetPosOnce)
		{
			itemMousePosx = Event.current.mousePosition.x;
			itemMousePosy = Event.current.mousePosition.y;
			itemGetPosOnce = false;
		}
		if (Popup.List (Rect(itemMousePosx, itemMousePosy, 100, 20), showList, listEntry, GUIContent(""), list, listStyle)) {
				picked = true;
		}
	} else {
    	GUI.DragWindow (Rect (0,0,10000,20));
    }
	
}

function DrawCharacterWindow () {
	if (GUI.Button (ResizeGUI(Rect (8,6,10,10)), "")) {
		CloseCharacterWindow ();
	}
	
	var currentSlot : EquipmentSlot;
	var currentRect : Rect;
	
	for (var i : int = 0; i < equipped.length; i++) {
		currentSlot = equippedSlot[i];
		currentRect = ResizeGUI(currentSlot.slotRect);
		if (equipped[i] == null) {
			GUI.DrawTexture (currentRect, currentSlot.slotIcon);			//	Slot Rect & Empty Slot Icon
		} else {
			GUI.DrawTexture (currentRect, equipped[i].itemIcon);			//	Slot Rect & Item Icon
			if (GUI.Button (currentRect, "", GUIStyle ("label"))) {
				if (Input.GetMouseButtonUp (0)) {							//	... if that click is mouse button 0: Remove/Unequip it.
					var success : boolean = AddItem (equipped[i]);			//	Remove/Unequip it.
					if (success)								//	If it's successfully added to the inventory, remove it here
						equipped[i] = null;
					GameObject.Find("Weapons").GetComponent(PlayerWeapons).UpdateCurrentGun();
				}
			}
		}
	}
	if(dragging && !itemMenu)
	{
		currentDraggable.x = Event.current.mousePosition.x;
		currentDraggable.y = Event.current.mousePosition.y;
		GUI.DrawTexture(currentDraggable, currentDraggableItem.itemIcon);
	}
	
	if(itemMenu)
	{
		if(charGetPosOnce) 
		
		{
			charMousePosx = Event.current.mousePosition.x;
			charMousePosy = Event.current.mousePosition.y;
			charGetPosOnce = false;
		}
		if (Popup.List (Rect(charMousePosx, charMousePosy, 100, 20), showList, listEntry, GUIContent(""), list, listStyle)) {
				picked = true;
		}
	} else {
    	GUI.DragWindow (Rect (0,0,10000,20));
    }
}

function DrawInfoWindow() {
	if (GUI.Button (ResizeGUI(Rect (8,6,10,10)), "")) {
		CloseInfoWindow ();
	}
	
	GUI.DrawTexture(ResizeGUI(Rect(120-((iconWidthHeight*infoItem.width)/2),20,
						iconWidthHeight*infoItem.width,
						iconWidthHeight*infoItem.height)),
						infoItem.itemIcon);
	
	GUI.Label(ResizeGUI(Rect(5,20+(iconWidthHeight*infoItem.height),225,160)), infoItem.description);
    
   if(itemMenu)
	{
		if(infoGetPosOnce)
		{
			infoMousePosx = Event.current.mousePosition.x;
			infoMousePosy = Event.current.mousePosition.y;
			infoGetPosOnce = false;
		}
		if (Popup.List (Rect(infoMousePosx, infoMousePosy, 100, 20), showList, listEntry, GUIContent(""), list, listStyle)) {
			picked = true;
		}
	} else {
    	GUI.DragWindow (Rect (0,0,10000,20));
    }
}

function OpenLootWindow (newLootableItem : LootableObject, newContentArray : List.<InventoryItem>) {
	//	Controls whether or not to open the loot winow and points Inventory.js to the correct currentLootableItem
	//if (currentLootableItem != newLootableItem) {						//	If the LootableItem has changed...
		currentLootableItem = newLootableItem;							//	Set the new Lootable Item the Current Lootable Item
		contentArray = newContentArray;									//	Set the Content Array to the new Content Array
		/*for(var i=0; i<contentArray.Count; i++)
			Debug.Log(contentArray[i].itemName);*/
		openLootWindow = true;											//	Set the open trap on the Loot Window to "true", so if it's open is stays open, if not, it opens it
		openInventoryWindow = true;										//	Set the open trap on the Inventory Window "true", so if it's open is stays open, if not, it opens it
		openCharacterWindow = false;
		if (currentLootableItem != null) {								//	... and if the current Lootable is not Null ...
			currentLootableItem.UpdateContentArray(contentArray);		//	... replace the contents with the updated contents.
			currentLootableItem.LootWindowClosed ();
		}
	/*} else {
		openLootWindow = !openLootWindow;								//	This toggles the loot window
		if (openLootWindow)												//	If the user clicks on the same Lootable Object, the window closes
			openInventoryWindow = true;
		openCharacterWindow = false;
	}*/
}


function CloseLootWindow () {
	openLootWindow = false;
}

function CloseCharacterWindow () {
	openCharacterWindow = false;
}

function CloseInventoryWindow () {
	openInventoryWindow = false;
}

function CloseInfoWindow () {
	openInfoWindow = false;
}

function LootableObjectOutofRange () {
	openLootWindow = false;
	openInventoryWindow = false;
}

function AddItem (originalItem : InventoryItem) {
	var continueOuterLoop : boolean;
	if(originalItem.maxStack > 1) {
		for(var i=0; i<inventory.length; i++) {
			if(inventory[i] != null && inventory[i].itemName == originalItem.itemName && inventory[i].stackSize < inventory[i].maxStack) {
				if(inventory[i].stackSize + originalItem.stackSize < inventory[i].maxStack) {
					inventory[i].stackSize += originalItem.stackSize;
					return true;
				} else {
					originalItem.stackSize = inventory[i].maxStack - inventory[i].stackSize;
					inventory[i].stackSize = inventory[i].maxStack;
				}
			}
		}
	}
	// necessary for deep copy
	var item = new InventoryItem();
	item.itemName = originalItem.itemName;
	item.description = originalItem.description;
	item.itemIcon = originalItem.itemIcon;
	item.slotType = originalItem.slotType;
	item.width = originalItem.width;
	item.height = originalItem.height;
	item.weaponCode = originalItem.weaponCode;
	item.stackSize = originalItem.stackSize;
	item.maxStack = originalItem.maxStack;
	item.ammoType = originalItem.ammoType;
	item.ammoCapacity = originalItem.ammoCapacity;
	for (i = 0; i < inventory.length; i++) {					//	Go through each row and check if empty
		continueOuterLoop = false;
		if(i+item.width > inventory.length 
		|| (i%inventoryWidth)+item.width > inventoryWidth
		|| (((i%inventoryWidth)+item.width > inventory.length%inventoryWidth) && (i/inventoryWidth)+item.height > (inventory.length/inventoryWidth))
		|| (i/inventoryWidth)+item.height-1 > (inventory.length/inventoryWidth))	{  // If the item + item width is too big, keep searching
			continueOuterLoop = true;
		}
		for(var l : int = 0; l < item.height && !continueOuterLoop; l++) {
			for(var m : int = 0; m < item.width; m++) {
				if(inventory[i+m+(l*inventoryWidth)] != null) {
					continueOuterLoop = true;
				}
			}
		}
		for(var n : int = 0; n < item.height && !continueOuterLoop; n++) {
			for(var o : int = 0; o < item.width; o++) {
				inventory[i+o+(n*inventoryWidth)] = placeHolder;							//  add Placeholder for items bigger than 1x1
			}
		}
		if(!continueOuterLoop)
		{
			item.position = i;
			inventory[i] = item;											//	... add the new item....
			if(item.slotType == SlotType.Ammo && mainCamera.GetComponentInChildren(PlayerWeapons).GetCurrentGun())
				mainCamera.GetComponentInChildren(PlayerWeapons).GetCurrentGun().checkAmmo();
			return true;
		}
	}
	Debug.Log ("Inventory is full");
	return (false);
}

function EquipItem (item : InventoryItem) {
	for (var i : int = 0; i < equipped.length; i ++) {
		if (equippedSlot[i].slotType == item.slotType) {
			if (equipped[i] == null) {
				equipped[i] = item;
				return (true);
			}
		}
	}
	Debug.Log ("Cannot Equip this Item");
	return (false);
}

function ResizeInventory (newInventoryLength) {							//	This code is never called at this point, but can be when you integrate it.
	var oldInventory : InventoryItem[] = inventory;
	
	inventory = new Array (newInventoryLength);
	for (var i : int = 0; i < oldInventory.length; i++) { 
		inventory[i] = oldInventory[i];
	}
	
	for (var j : int = oldInventory.length; j < inventory.length; j++) { 
		inventory[i] = null;
	}
}

function OpenInventoryButton() {									//	... toggle the inventory window.
	if (!GameManager.isPaused) {												
		openInventoryWindow = false;
		openLootWindow = false;											
		openInfoWindow = false;
		openCharacterWindow = false;
	} else {
		openInventoryWindow = true;
		openCharacterWindow = true;
		audio.PlayOneShot(openInventorySound);
	}
}

function getPrimaryWeapon() {
	return equipped[0];
}

function getSecondaryWeapon() {
	return equipped[1];
}

function ResizeGUI(_rect : Rect) : Rect
{
    var FilScreenWidth = _rect.width / 1440;
    var rectWidth = FilScreenWidth * Screen.width;
    var FilScreenHeight = _rect.height / 810;
    var rectHeight = FilScreenHeight * Screen.height;
    var rectX = (_rect.x / 1440) * Screen.width;
    var rectY = (_rect.y / 810) * Screen.height;
 
    return Rect(rectX,rectY,rectWidth,rectHeight);
}