#pragma strict

static var NOGUN = 0;
var ActiveGun = NOGUN;
@HideInInspector
var switchTime = 0;
@HideInInspector
var isSwitching = false;
@HideInInspector
var isThrowing = false;
private var oldMouseX = 0;
private var newMouseX = 0;
private var oldMouseY = 0;
private var newMouseY = 0;
private var mouseSpeedX = 0;
private var mouseSpeedY = 0;
private var primaryWeaponCode = NOGUN;
private var secondaryWeaponCode = NOGUN;
var switchMotionLimit : float = 0.1;
private var guiOverlayTexture : GUITexture;

var currentGrenade : GameObject;
var grenadePlaceholder : GameObject;

private var camDirection : Vector3;

var camTransf : Transform;

var thePlayer : GameObject;

var playerNetLookObject : GameObject;

function Awake()
{
	
	for(var i=0;i<transform.childCount;i++)
	{
		if(i == ActiveGun)
		{
			transform.GetChild(0).gameObject.SetActiveRecursively(true);
		}
		else
		{
			if(i != 0)
			{
				if(!thePlayer.GetComponent(FPSPlayer).isControllable) {
					transform.GetChild(i).GetComponent(MultiplayerModelManager).DeactivateMultiplayerModels(false);
				} else {
					transform.GetChild(i).GetComponent(MultiplayerModelManager).DeactivateLocalModels(false);
				}
			}
			transform.GetChild(i).gameObject.SetActiveRecursively(false);
		}
	}
	
	guiOverlayTexture = GameObject.Find("GUIOverlay").GetComponent(GUITexture);
}

function Update () 
{
	if(thePlayer.GetComponent(FPSPlayer).isControllable)
	{
		if(Input.GetButton("Fire1") && !GameManager.isPaused && !isSwitching && !Input.GetKey("left shift") && !Input.GetKey("right shift"))
		{
			if(ActiveGun != NOGUN)
			{
				GetCurrentGun().Fire();
			}
		}
		
	    if(!isThrowing && Input.GetKey("g") && CheckGrenade() && !GameManager.isPaused && !isSwitching && !Input.GetMouseButtonDown(1) && !Input.GetKey("left shift") && !Input.GetKey("right shift") && !Input.GetButton("Fire1"))
	    {
	    	isThrowing = true;
	    	ThrowGrenade();
	    	thePlayer.SendMessage("NetworkGrenade");
	    }
		
		if(Input.GetKeyDown("1") && !isSwitching
		&& transform.GetChild(ActiveGun).GetComponent(MachineGun).reloading == false
		&& !GameManager.isPaused
		&& primaryWeaponCode != NOGUN)
		{
			switchTime = 1;
			SelectWeapon(primaryWeaponCode, false);
		}
		else if(Input.GetKeyDown("2") && !isSwitching
		&& transform.GetChild(ActiveGun).GetComponent(MachineGun).reloading == false
		&& !GameManager.isPaused
		&& secondaryWeaponCode != NOGUN)
		{
			switchTime = 1;
			SelectWeapon(secondaryWeaponCode, false);
		}/*
		else if(Input.GetKeyDown("3") && !isSwitching
		&& transform.GetChild(ActiveGun).GetComponent(MachineGun).reloading == false
		&& Time.timeScale != 0)
		{
			SelectWeapon(2);
		}*/
		
	    if(Input.GetKey("r") && ActiveGun != NOGUN && !GetCurrentGun().reloading && !GameManager.isPaused)
	    {
	    	GetCurrentGun().Reload();
	   	}
		
		newMouseX = Input.mousePosition.x;
		newMouseY = Input.mousePosition.y;
		if((newMouseX != oldMouseX || newMouseY != oldMouseY) && !GameManager.isPaused)
		{
			mouseSpeedX = newMouseX - oldMouseX;
			mouseSpeedY = newMouseY - oldMouseY;
			if(transform.GetComponentInChildren(MachineGun) != null)
				transform.GetComponentInChildren(MachineGun).lookSway(mouseSpeedX, mouseSpeedY);
			oldMouseX = newMouseX;
			oldMouseY = newMouseY;
		}
		if(!GameManager.isPaused) {
			if(transform.GetComponentInChildren(MachineGun) != null)
				transform.GetComponentInChildren(MachineGun).resetRotation();
		}
		
		if(transform.parent.parent.GetComponent(FPSPlayer).walking == true && !GameManager.isPaused)
		{
			if(transform.GetComponentInChildren(MachineGun) != null)
				transform.GetComponentInChildren(MachineGun).walkSway();
		} else if(!GameManager.isPaused) {
			if(transform.GetComponentInChildren(MachineGun) != null)
				transform.GetComponentInChildren(MachineGun).resetPosition();
		}
		
		if(ActiveGun == NOGUN) {
			guiOverlayTexture.enabled = false;
		} else {
			guiOverlayTexture.enabled = true;
		}
	}
}

function SelectWeapon(index : int, reload : boolean)
{
	if(!reload && index == ActiveGun)
		return;
	isSwitching = true;
	var switchMotion : float = switchTime;
	var startMotion = transform.localRotation.x;
	var currentRotX = transform.localRotation.x;
	while(switchMotion > switchTime*0.5)
	{
		switchMotion -= Time.deltaTime;
		if(thePlayer.GetComponent(FPSPlayer).isControllable)
		{
			currentRotX += switchMotionLimit * (Time.deltaTime/(switchTime*0.5));
			//currentRotX = Mathf.Clamp(currentRotX,startMotion,startMotion+switchMotionLimit);
			transform.localRotation.x = currentRotX;
		}
		yield;
	}
	for(var i=0;i<transform.childCount;i++)
	{
		if(i == index)
		{
			transform.GetChild(i).gameObject.SetActiveRecursively(true);
			if(i != 0)
			{
				if(!thePlayer.GetComponent(FPSPlayer).isControllable) {
					transform.GetChild(i).GetComponent(MultiplayerModelManager).MultiplayerModels();
				} else {
					transform.GetChild(i).GetComponent(MultiplayerModelManager).LocalModels();
				}
			}
			ActiveGun = index;
		}
		else
		{
			if(i != 0)
				transform.GetChild(i).GetComponent(MultiplayerModelManager).DeactivateMultiplayerModels(false);
			transform.GetChild(i).gameObject.SetActiveRecursively(false);
		}
	}
	while(switchMotion > 0)
	{
		switchMotion -= Time.deltaTime;
		if(thePlayer.GetComponent(FPSPlayer).isControllable)
		{
			currentRotX -= switchMotionLimit * (Time.deltaTime/(switchTime*0.5));
			//currentRotX = Mathf.Clamp(currentRotX,startMotion,startMotion+switchMotionLimit);
			transform.localRotation.x = currentRotX;
		}
		yield;
	}
	if(thePlayer.GetComponent(FPSPlayer).isControllable)
	{
		transform.localRotation.x = startMotion;
		thePlayer.SendMessage("SetGun", ActiveGun, SendMessageOptions.DontRequireReceiver);
	}
	isSwitching = false;
}

function GetCurrentGun() : MachineGun
{
	if(ActiveGun != NOGUN)
		return transform.GetChild(ActiveGun).GetComponent(MachineGun);
	return null;
}

function UpdateCurrentGun() {
	while(isSwitching)
		yield;
	var tempWeapon : InventoryItem = GameObject.Find("InventoryManager").GetComponent(Inventory).getPrimaryWeapon();
	var tempWeapon2 : InventoryItem = GameObject.Find("InventoryManager").GetComponent(Inventory).getSecondaryWeapon();

	if(tempWeapon2 != null && tempWeapon2.weaponCode != null) {
		primaryWeaponCode = NOGUN;
		switchTime = 1;
		secondaryWeaponCode = tempWeapon2.weaponCode;
		SelectWeapon(tempWeapon2.weaponCode, false);
	}
	if(tempWeapon != null && tempWeapon.weaponCode != null) {
		switchTime = 1;
		primaryWeaponCode = tempWeapon.weaponCode;
		SelectWeapon(tempWeapon.weaponCode, false);
	}
	if(tempWeapon == null && tempWeapon2 == null) {
		switchTime = 1;
		SelectWeapon(NOGUN, false);
		primaryWeaponCode = NOGUN;
		secondaryWeaponCode = NOGUN;
	}
}

function ThrowGrenade()
{
    RemoveGrenade();
	yield WaitForSeconds(1);
	if(thePlayer.GetComponent(FPSPlayer).isControllable)
		camDirection = camTransf.forward;
	else
		camDirection = -playerNetLookObject.transform.forward;
	camDirection.y += 0.3;
	var newGrenade : GameObject;
	if(PlayerPrefs.GetInt("IsMultiplayer") == 1)
		newGrenade = PhotonNetwork.InstantiateSceneObject(currentGrenade.name, grenadePlaceholder.transform.position+camDirection, transform.rotation, 0, null);
	else
		newGrenade = Instantiate(currentGrenade, grenadePlaceholder.transform.position+camDirection, transform.rotation);
	if(newGrenade)
		newGrenade.rigidbody.AddForce(camDirection*15,ForceMode.Impulse);
    isThrowing = false;
}

function CheckGrenade()
{
	var tempInv : InventoryItem[] = GameObject.Find("InventoryManager").GetComponent(Inventory).equipped;
	for(var i=0; i<tempInv.length; i++) {
		if(tempInv[i] == null)
			continue;
		if( tempInv[i].slotType == SlotType.Grenade) {
			return true;
		}
	}
	return false;
}

function RemoveGrenade()
{
	var tempInv : InventoryItem[] = GameObject.Find("InventoryManager").GetComponent(Inventory).equipped;
	for(var i=0; i<tempInv.length; i++) {
		if(tempInv[i] == null)
			continue;
		if( tempInv[i].slotType == SlotType.Grenade) {
			tempInv[i] = null;
		}
	}
}