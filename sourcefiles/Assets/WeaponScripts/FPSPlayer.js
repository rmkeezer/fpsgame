var maximumHitPoints = 100.0;
var hitPoints = 100.0;

// used for reference by other scripts
var mainCamera : GameObject;
var mainCameraController : GameObject;

var bulletGUI : GUIText;
var rocketGUI : DrawRockets;
var healthGUI : GUITexture;

var walkSounds : AudioClip[];
var painLittle : AudioClip;
var painBig : AudioClip;
var die : AudioClip;
var audioStepLength = 0.3;
var playerXVelocity = 0;
var playerYVelocity = 0;

var crouchingCamHeight = -1.2;
var crouchDeltaHeight = -1.2;
var standardCamHeight = 0;

private var machineGun : MachineGun;
private var rocketLauncher : RocketLauncher;
@HideInInspector
var playerWeapons : PlayerWeapons;
private var healthGUIWidth = 0.0;
private var gotHitTimer = -1.0;
private var oldPositionX;
private var newPositionX;
private var oldPositionZ;
private var newPositionZ;

static var walking : boolean = false;

var walkSpeed: float = 7; // regular speed
var crchSpeed: float = 3; // crouching speed
var runSpeed: float = 14; // run speed

private var chMotor : CharacterMotor;
private var ch : CharacterController;
private var tr : Transform;
private var height : float; // initial height
var speed : float;

var rocketTextures : Texture[];

var crosshairTextureX : Texture2D;
var crosshairTextureY : Texture2D;
private var crosshairPositionX : Rect;
private var crosshairPositionY : Rect;
private var crosshairCurrentX : Rect;
private var crosshairCurrentY : Rect;
private var gunAccuracy : float;
private var currentRecoil : float;

private var zooming : boolean = false;

private var XSensitivity : float;
private var YSensitivity : float;

var bloodTexture : GameObject;

@HideInInspector
var inVehicle : boolean;
@HideInInspector
var vehicleSeat : Transform;

private var downOnce : boolean = true;

var isControllable : boolean = false;

var deadReplacement : GameObject;

@HideInInspector
var waitingForSend : boolean = false;


function Awake () 
{
	bloodTexture = GameObject.Find("BloodScreen");

	bulletGUI = GameObject.Find("BulletText").GetComponent(GUIText);
	rocketGUI = GameObject.Find("BulletImgs").GetComponent(DrawRockets);
	healthGUI = GameObject.Find("healthBar").GetComponent(GUITexture);

	XSensitivity = GetComponent(MouseLook).sensitivityX;
	YSensitivity = GetComponentsInChildren(MouseLook)[1].sensitivityY;

	oldPositionX = transform.position.x;
	oldPositionZ = transform.position.z;

	playerWeapons = GetComponentInChildren(PlayerWeapons);
	machineGun = playerWeapons.GetCurrentGun();
	rocketLauncher = GetComponentInChildren(RocketLauncher);
	
	PlayStepSounds();

	healthGUIWidth = healthGUI.pixelInset.width;
	
    chMotor = GetComponent(CharacterMotor);
    tr = transform;
    ch = GetComponent(CharacterController);
	height = ch.height;
	
	
	crosshairPositionX = Rect((Screen.width - crosshairTextureX.width)/2,
		(Screen.height - crosshairTextureX.height)/2,
		crosshairTextureX.width, crosshairTextureX.height);
	crosshairPositionY = Rect((Screen.width - crosshairTextureY.width)/2,
		(Screen.height - crosshairTextureY.height)/2,
		crosshairTextureY.width, crosshairTextureY.height);
	crosshairCurrentX = Rect((Screen.width - crosshairTextureX.width)/2,
		(Screen.height - crosshairTextureX.height)/2,
		crosshairTextureX.width, crosshairTextureX.height);
	crosshairCurrentY = Rect((Screen.width - crosshairTextureY.width)/2,
		(Screen.height - crosshairTextureY.height)/2,
		crosshairTextureY.width, crosshairTextureY.height);
}

function ApplyDamage (damage : float) {
	if (hitPoints < 0.0)
		return;

	// Apply damage
	hitPoints -= damage;
	
	// blood screen
	if(isControllable) {
		FlashWhenHit();
	}

	// Play pain sound when getting hit - but don't play so often
	if (Time.time > gotHitTimer && painBig && painLittle) {
		// Play a big pain sound
		if (hitPoints < maximumHitPoints * 0.2 || damage > 20) {
			audio.PlayOneShot(painBig, 1.0 / audio.volume);
			gotHitTimer = Time.time + Random.Range(painBig.length * 2, painBig.length * 3);
		} else {
			// Play a small pain sound
			audio.PlayOneShot(painLittle, 1.0 / audio.volume);
			gotHitTimer = Time.time + Random.Range(painLittle.length * 2, painLittle.length * 3);
		}
	}

	// Are we dead?
	if (hitPoints < 0.0) {
		Die();
	}
}

function Die () {
	if (die)
		AudioSource.PlayClipAtPoint(die, transform.position);
	
	// Disable all script behaviours (Essentially deactivating player control)
	/*var coms : Component[] = GetComponentsInChildren(MonoBehaviour);
	for (var b in coms) {
		var p : MonoBehaviour = b as MonoBehaviour;
		if (p)
			p.enabled = false;
	}*/
	
	transform.position.y += 0.5;
	
	var tempDead = Instantiate(deadReplacement, transform.position, transform.rotation);
	
	if(!isControllable) {
		tempDead.GetComponent(DeadPlayer).deadCamera.active = false;
		tempDead.GetComponent(AudioListener).enabled = false;
	} else {
		SendMessage("SetDead", true);
	}
	
	
	gameObject.SetActiveRecursively(false);
	
	//LevelLoadFade.FadeAndLoadLevel(Application.loadedLevel, Color.black, 2.0);
}

function LateUpdate () {
	// Update gui every frame
	// We do this in late update to make sure machine guns etc. were already executed
	if(!isControllable)
		return;
		
	UpdateGUI();
}

function PlayStepSounds () {
	var controller : CharacterController = GetComponent(CharacterController);

	while (true) {
		if (controller.isGrounded && controller.velocity.magnitude > 0.3) {
			audio.clip = walkSounds[Random.Range(0, walkSounds.length)];
			audio.Play();
			yield WaitForSeconds(audioStepLength);
		} else {
			yield;
		}
	}
}


function UpdateGUI () {
	machineGun = playerWeapons.GetCurrentGun();
	// Update health gui
	// The health gui is rendered using a overlay texture which is scaled down based on health
	// - Calculate fraction of how much health we have left (0...1)
	var healthFraction = Mathf.Clamp01(hitPoints / maximumHitPoints);

	// - Adjust maximum pixel inset based on it
	healthGUI.pixelInset.xMax = healthGUI.pixelInset.xMin + healthGUIWidth * healthFraction;
	
	// clear bullet gui
	rocketGUI.UpdateRockets(0, 0, 0, 0);
	
	// Clear ammo text
	bulletGUI.text = "";
	
	
	// Update machine gun gui
	// Machine gun gui is simply drawn with a bullet counter text
	if (machineGun) {
		bulletGUI.text = machineGun.GetBulletsLeft().ToString() + " / " + (machineGun.GetAmmoLeft());
		rocketGUI.UpdateRockets(machineGun.GetBulletsLeft(), machineGun.GetClipSize(), machineGun.GetBulletWidth(), machineGun.GetBulletHeight());
	}
	
	// Update rocket gui
	// This is changed from the tutorial PDF. You need to assign the 20 Rocket textures found in the GUI/Rockets folder
	// to the RocketTextures property.
	if (rocketLauncher)	{
		/*if (rocketTextures.Length == 0) {
			Debug.LogError ("The tutorial was changed with Unity 2.0 - You need to assign the 20 Rocket textures found in the GUI/Rockets folder to the RocketTextures property.");
		} else {
			rocketGUI.texture = rocketTextures[rocketLauncher.ammoCount];
		}*/
	}
}

function FixedUpdate()
{
	// check if walking or not
	newPositionX = transform.position.x;
	newPositionZ = transform.position.z;
	if(newPositionX != oldPositionX && newPositionZ != oldPositionZ)
	{
		playerXVelocity = Mathf.Abs(newPositionX - oldPositionX);
		playerZVelocity = Mathf.Abs(newPositionZ - oldPositionZ);
		if((playerXVelocity > 0) || (playerZVelocity > 0)){
			if(!walking){
				walking = true;
			}
		} else if(walking){
		    walking = false;
		}
		oldPositionX = newPositionX;
		oldPositionZ = newPositionZ;
	} else {
		walking = false;
	}
}

function Update()
{
	if(!isControllable)
		return;
		
	if(Input.GetMouseButtonDown(1) && !Input.GetKey("left shift") && !Input.GetKey("right shift") && !playerWeapons.isSwitching && !playerWeapons.isThrowing)
	{
		zooming = true;
		BroadcastMessage("zoomIn", SendMessageOptions.DontRequireReceiver);
		GetComponent(MouseLook).sensitivityX = XSensitivity/2;
		GetComponentsInChildren(MouseLook)[1].sensitivityY = YSensitivity/2;
	} 
	else if(Input.GetMouseButtonUp(1))
	{
		zooming = false;
		BroadcastMessage("zoomOut", SendMessageOptions.DontRequireReceiver);
		GetComponent(MouseLook).sensitivityX = XSensitivity;
		GetComponentsInChildren(MouseLook)[1].sensitivityY = YSensitivity;
	}

    var h = height;
    if(ch.isGrounded && !Input.GetKey("left shift") && !Input.GetKey("right shift"))
    {
    	speed = walkSpeed;
    	if(playerWeapons.ActiveGun != PlayerWeapons.NOGUN) {
        	playerWeapons.GetCurrentGun().charSpeed = (speed/7.0);
        	playerWeapons.GetCurrentGun().changeJiggle(ch.velocity.magnitude*2, false);
        }
    }	
    
    if(ch.isGrounded && (Input.GetKey("left shift") || Input.GetKey("right shift")) && !Input.GetButton("Zoom") && !playerWeapons.isSwitching && !playerWeapons.isThrowing)
    {
        speed = runSpeed;
        if(playerWeapons.ActiveGun != PlayerWeapons.NOGUN) {
        	playerWeapons.GetCurrentGun().charSpeed = (speed/7.0);
        	playerWeapons.GetCurrentGun().changeJiggle(ch.velocity.magnitude*4, true);
        }
    }
    if(Input.GetKey("c")) // press C to crouch
    {
    	if(downOnce) {
    		SendMessage("SetCrouch", true, SendMessageOptions.DontRequireReceiver);
    		downOnce = false;
    	}
        h = 0.5 * height;
        if(ch.isGrounded)
        {
        	speed = crchSpeed; // slow down when crouching
    		if(playerWeapons.ActiveGun != PlayerWeapons.NOGUN) {
	        	playerWeapons.GetCurrentGun().charSpeed = (speed/7.0);
	        	playerWeapons.GetCurrentGun().changeJiggle(ch.velocity.magnitude*2, false);
        	}
        }
    }
    if(Input.GetKeyUp("c")) // press C to crouch
    {
    	SendMessage("SetCrouch", false, SendMessageOptions.DontRequireReceiver);
    	downOnce = true;
    }
    
    if(inVehicle)
    {
    	speed = 0;
    	transform.position = vehicleSeat.position;
    }
    chMotor.movement.maxForwardSpeed = speed; // set max speed
    chMotor.movement.maxSidewaysSpeed = speed/1.5;
    chMotor.movement.maxBackwardsSpeed = speed/2.0;
    var lastHeight = ch.height; // crouch/stand up smoothly 
    ch.height = Mathf.Lerp(ch.height, h, 5*Time.deltaTime);
    tr.position.y += (ch.height-lastHeight)/2; // fix vertical position
    SendMessage("SetSpeed", ch.velocity.magnitude, SendMessageOptions.DontRequireReceiver);
}

function OnGUI()
{
	if(!zooming && isControllable)
	{
		if(playerWeapons.ActiveGun != PlayerWeapons.NOGUN)
		{
			gunAccuracy = GetComponentInChildren(PlayerWeapons).GetCurrentGun().accuracy;
			currentRecoil = GetComponentInChildren(PlayerWeapons).GetCurrentGun().recoil;
			crosshairCurrentX.x = crosshairPositionX.x + (gunAccuracy*currentRecoil*100*speed);
			GUI.DrawTexture(crosshairCurrentX, crosshairTextureX);
			crosshairCurrentX.x = crosshairPositionX.x - (gunAccuracy*currentRecoil*100*speed);
			GUI.DrawTexture(crosshairCurrentX, crosshairTextureX);
			crosshairCurrentY.y = crosshairPositionY.y + (gunAccuracy*currentRecoil*100*speed);
			GUI.DrawTexture(crosshairCurrentY, crosshairTextureY);
			crosshairCurrentY.y = crosshairPositionY.y - (gunAccuracy*currentRecoil*100*speed);
			GUI.DrawTexture(crosshairCurrentY, crosshairTextureY);
		}
	}
}



function Fade (start : float, end : float, length : float, bloodTexture : GameObject) 
{ //define Fade parmeters
	/*if (bloodTexture.guiTexture.color.a == start)
	{*/

		for (i = 0.0; i < 1.0; i += Time.deltaTime*(1/length)) { //for the length of time
			bloodTexture.guiTexture.color.a = Mathf.Lerp(start, end, i); //lerp the value of the transparency from the start value to the end value in equal increments
			yield;
			bloodTexture.guiTexture.color.a = end; // ensure the fade is completely finished (because lerp doesn't always end on an exact value)
	    } //end for
	//} //end if
} //end Fade

function FlashWhenHit ()
{
    Fade (0, 0.5, 0.5, bloodTexture);
    yield WaitForSeconds (.01);
    Fade (0.5, 0, 0.5, bloodTexture);
}

function SetIsControl(control : boolean)
{
	isControllable = control;
	GetComponent(MouseLook).enabled = isControllable;
	mainCameraController.GetComponent(MouseLook).enabled = isControllable;
}

function SetPlayerHP(hp : int)
{
	if(hitPoints-hp > 0)
		ApplyDamage(hitPoints-hp);
}

function SetPlayerGun(gun : int)
{
	playerWeapons.SelectWeapon(gun, false);
}

function Fire(hitPosition : Vector3)
{
	playerWeapons.GetCurrentGun().Fire(hitPosition);
}

function Reload()
{
	playerWeapons.GetCurrentGun().NetReload();
}

function CheckControllable() : boolean
{
	return isControllable;
}

function GetCamera() : Camera
{
	return mainCamera.camera;
}

function SetNetworkDead()
{
	Die();
}

function ThrowNetworkGrenade()
{
	playerWeapons.isThrowing = true;
	playerWeapons.ThrowGrenade();
}