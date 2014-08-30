//	LootTable.js
//	This script contains temporary code for creating a current loot set for a lootableObject
//	Attach to your Inventory Manager Object

var iconTexture01 : Texture2D;												//	Variables for your Icon Textures
var iconTexture02 : Texture2D;
var iconTexture03 : Texture2D;
var iconTexture04 : Texture2D;
var iconTexture05 : Texture2D;
var iconTexture06 : Texture2D;
var iconTexture07 : Texture2D;
var iconTexture08 : Texture2D;
var iconTexture09 : Texture2D;
var iconTexture10 : Texture2D;
var iconTexture11 : Texture2D;
var iconTexture12 : Texture2D;
var iconTexture13 : Texture2D;
var iconTexture14 : Texture2D;
var iconTexture15 : Texture2D;

static var lootArray : List.<InventoryItem>;											//	An array containing your loot items


function Start () {
	lootArray = new List.<InventoryItem>();										//	Size the array
	
	for (var i : int = 0; i < 15; i ++) {						//	Populate the array with empty items
		lootArray.Add(new InventoryItem());
		lootArray[i].stackSize = 1;
		lootArray[i].maxStack = 1;
		lootArray[i].ammoType = "";
		lootArray[i].ammoCapacity = 0;
	}

	lootArray[0].itemName = "M1917 Enfield";
	lootArray[0].description = "Name: M1917 Enfield\nSize: 1x4\nType: Primary\nAmmo: .30-06 Springfield";	// DOESNT WORK
	lootArray[0].itemIcon = iconTexture01;	
	lootArray[0].slotType = SlotType.Primary;
	lootArray[0].weaponCode = 1;
	lootArray[0].width = 4;
	lootArray[0].height = 1;
	lootArray[0].ammoType = ".30-06 Springfield";
	lootArray[0].ammoCapacity = 6;
	lootArray[1].itemName = "M1918 BAR";
	lootArray[1].description = "Name: M1918 Browning Automatic Rifle\nSize: 1x4\nType: Primary\nAmmo: .30-06 Springfield";	
	lootArray[1].itemIcon = iconTexture02;	
	lootArray[1].slotType = SlotType.Primary;
	lootArray[1].weaponCode = 2;
	lootArray[1].width = 4;
	lootArray[1].height = 1;
	lootArray[1].ammoType = ".45 ACP";	
	lootArray[1].ammoCapacity = 20;
	lootArray[2].itemName = ".30-06 Springfield";
	lootArray[2].description = "Name: .30-06 Springfield\nSize: 1x1\nType: Ammo\nStack: 6";
	lootArray[2].itemIcon = iconTexture03;
	lootArray[2].slotType = SlotType.Ammo;
	lootArray[2].weaponCode = 1;
	lootArray[2].width = 1;
	lootArray[2].height = 1;
	lootArray[2].maxStack = 6;
	lootArray[3].itemName = "M1911 Colt";
	lootArray[3].description = "Name: M1911 Colt\nSize: 2x2\nType: Secondary\nAmmo: .45 ACP\nStack: 20";
	lootArray[3].itemIcon = iconTexture04;
	lootArray[3].slotType = SlotType.Secondary;
	lootArray[3].weaponCode = 1;
	lootArray[3].width = 2;
	lootArray[3].height = 2;
	lootArray[4].itemName = ".45 ACP";
	lootArray[4].description = "Name: .45 ACP\nSize: 1x1\nType: Ammo";
	lootArray[4].itemIcon = iconTexture05;
	lootArray[4].slotType = SlotType.Ammo;
	lootArray[4].width = 1;
	lootArray[4].height = 1;
	lootArray[4].maxStack = 20;
	lootArray[5].itemName = "Mk 1 Grenade";
	lootArray[5].description = "Name: Mk 1 Grenade\nSize: 1x1\nType: Grenade";
	lootArray[5].itemIcon = iconTexture06;
	lootArray[5].slotType = SlotType.Grenade;
	lootArray[5].width = 1;
	lootArray[5].height = 1;
	lootArray[6].itemName = "Mark 1 Trench Knife";
	lootArray[6].description = "Name: Mark 1 Trench Knife\nSize: 2x1\nType: Knife";
	lootArray[6].itemIcon = iconTexture07;
	lootArray[6].slotType = SlotType.Knife;
	lootArray[6].width = 1;
	lootArray[6].height = 2;
	lootArray[7].itemName = "M1917 Steel Helmet";
	lootArray[7].description = "Name: M1917 Steel Helmet\nSize: 1x2\nType: Hat";
	lootArray[7].itemIcon = iconTexture08;
	lootArray[7].slotType = SlotType.Hat;
	lootArray[7].width = 2;
	lootArray[7].height = 1;
	lootArray[8].itemName = "M1917 Boots";
	lootArray[8].description = "Name: M1917 Boots\nSize: 1x2\nType: Shoes";
	lootArray[8].itemIcon = iconTexture09;
	lootArray[8].slotType = SlotType.Shoes;
	lootArray[8].width = 2;
	lootArray[8].height = 1;
	lootArray[9].itemName = "AEF Wool Tunic";
	lootArray[9].description = "Name: AEF Wool Tunic\nSize: 2x2\nType: Shirt";
	lootArray[9].itemIcon = iconTexture10;
	lootArray[9].slotType = SlotType.Shirt;
	lootArray[9].width = 2;
	lootArray[9].height = 2;
	lootArray[10].itemName = "AEF Wool Breeches";
	lootArray[10].description = "Name: AEF Wool Breeches\nSize: 3x2\nType: Pants";
	lootArray[10].itemIcon = iconTexture11;
	lootArray[10].slotType = SlotType.Pants;
	lootArray[10].width = 2;
	lootArray[10].height = 3;
	lootArray[11].itemName = "Wool Gloves";
	lootArray[11].description = "Name: Wool Gloves\nSize: 1x2\nType: Gloves";
	lootArray[11].itemIcon = iconTexture12;
	lootArray[11].slotType = SlotType.Gloves;
	lootArray[11].width = 2;
	lootArray[11].height = 1;
	lootArray[12].itemName = "Zenith Pocket Watch";
	lootArray[12].description = "Name: Zenith Pocket Watch\nSize: 1x1\nType: Accessory";
	lootArray[12].itemIcon = iconTexture13;
	lootArray[12].slotType = SlotType.Accessory;
	lootArray[12].width = 1;
	lootArray[12].height = 1;
	lootArray[13].itemName = "Dennison Compass";
	lootArray[13].description = "Name: Dennison Compass\nSize: 1x1\nType: Accessory";
	lootArray[13].itemIcon = iconTexture14;
	lootArray[13].slotType = SlotType.Accessory;
	lootArray[13].width = 1;
	lootArray[13].height = 1;
	lootArray[14].itemName = "Kakadu Backpack";
	lootArray[14].description = "Name: Dennison Compass\nSize: 2x3\nType: Backpack";
	lootArray[14].itemIcon = iconTexture15;
	lootArray[14].slotType = SlotType.Backpack;
	lootArray[14].width = 2;
	lootArray[14].height = 3;
	
	GetComponent(Inventory).EquipItem(lootArray[3]);
	GetComponent(Inventory).EquipItem(lootArray[5]);
	GetComponent(Inventory).EquipItem(lootArray[6]);
	GetComponent(Inventory).EquipItem(lootArray[7]);
	GetComponent(Inventory).EquipItem(lootArray[8]);
	GetComponent(Inventory).EquipItem(lootArray[9]);
	GetComponent(Inventory).EquipItem(lootArray[10]);
	GetComponent(Inventory).EquipItem(lootArray[11]);
	GetComponent(Inventory).EquipItem(lootArray[12]);
	GetComponent(Inventory).EquipItem(lootArray[14]);
	GetComponent(Inventory).AddItem(lootArray[0]);
	GetComponent(Inventory).AddItem(lootArray[1]);
	var tempItem : InventoryItem = lootArray[2];
	tempItem.stackSize = tempItem.maxStack;
	GetComponent(Inventory).AddItem(tempItem);
	GetComponent(Inventory).AddItem(tempItem);
	tempItem = lootArray[4];
	tempItem.stackSize = tempItem.maxStack;
	GetComponent(Inventory).AddItem(tempItem);
	GetComponent(Inventory).AddItem(tempItem);
}

function NewLootContent (thisLootableItem : LootableObject) {			
	var contentArray = new List.<InventoryItem>();			
	
	for (var i : int = 0; i < Random.Range(1,6); i++) {				
		var newLootableItem = new InventoryItem();				
		newLootableItem = lootArray[Random.Range(0,lootArray.Count)];
		while(newLootableItem.slotType == SlotType.Primary)
			newLootableItem = lootArray[Random.Range(0,lootArray.Count)];
		if(Random.Range(0.0, 2.0) > 1.0)
			while(newLootableItem.slotType != SlotType.Ammo)
				newLootableItem = lootArray[Random.Range(0,lootArray.Count)];	
		newLootableItem.stackSize = Random.Range(1,newLootableItem.maxStack);
		contentArray.Add(newLootableItem);			
	}
	return contentArray;					
}