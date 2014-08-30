#pragma strict

var range = 100.0;
var fireRate = 0.05;
var force = 10.0;
var damage = 5.0;
var bulletsPerClip = 30;
var ammo = 90;
var reloadTime = 0.5;
var bulletWidth = 10;
var bulletHeight = 50;
var swayRate : float = 1;
var recoilRate : float = 3;
var accuracy = 0.05;
var baseRecoil = 5.0;
@HideInInspector
var recoil = 0.0;
var bulletHoleSize = 0.1;
private var verticalAccuracy = accuracy/2;

var hitMetalParticles : ParticleEmitter;
var hitDirtParticles : ParticleEmitter;
var hitDirtParticles2 : ParticleEmitter;
var hitWoodParticles : ParticleEmitter;
var hitManParticles : ParticleEmitter;
var smokeParticles : ParticleEmitter;
var bulletHoleMetal : Material;
var bulletHoleDirt : Material;
var bulletHoleWood : Material;
var bulletHoleMan : Material;
var muzzleFlash : Renderer;

var swayFactor : Vector3;
var walkSway1 : Vector3;
var walkSway2 : Vector3;
var midSway : Vector3;
var curVect : Vector3;
var startPosition : Vector3;

var splat : GameObject;

private var bulletsLeft : int = 0;
private var nextFireTime = 0.0;
private var m_LastFrameShot = -1;

private var swayTarget = 1;

@HideInInspector
var charSpeed : float = 0;

@HideInInspector
var reloading : boolean = false;

private var zooming : boolean = false;

private var startRotationY = 0;
private var startRotationX = 0;
private var startRotationZ = 0;
private var storedRotX : float;
private var startRotY : float;
private var endRotY : float;
private var currentRotY : float;
private var startRotX : float;
private var endRotX : float;
private var currentRotX : float;
private var startRotZ : float;
private var endRotZ : float;
private var currentRotZ : float;

private var zoomPoint : Vector3;

@HideInInspector
static var bulletHoleMetalObject : GameObject;
@HideInInspector
static var bulletHoleDirtObject : GameObject;
@HideInInspector
static var bulletHoleWoodObject : GameObject;
@HideInInspector
static var bulletHoleManObject : GameObject;
@HideInInspector
static var makeHoles : int = 0;

var fireSound : AudioSource;
var reloadSound : AudioSource;

var bulletTrail : LineRenderer;

var dirtImpact : AudioClip;
var manImpact : AudioClip;

private var startTime = 0;
private var swayDown = true;
private var resetTime = true;
private var walkjiggle = 15;

private var thePlayer : GameObject;
var camTransf : Transform;

private var direction : Vector3;
private var shootPositionObject : Vector3;

public var ammoType : String;

function Start () {
	thePlayer = transform.parent.GetComponent(PlayerWeapons).thePlayer;
	camTransf = transform.parent.GetComponent(PlayerWeapons).camTransf;
	shootPositionObject = camTransf.transform.position;

	startTime = Time.time;

	recoil = baseRecoil;

	startRotationY = transform.localRotation.y;
	startRotationX = transform.localRotation.x;
	startRotationZ = transform.localRotation.z;
	storedRotX = startRotationX;
	startRotY = startRotationY;
	endRotY = startRotY+walkjiggle;
	currentRotY = startRotY;
	startRotX = startRotationX;
	endRotX = startRotX+walkjiggle;
	currentRotX = startRotX;
	startRotZ = startRotationZ;
	endRotZ = startRotZ+walkjiggle;
	currentRotZ = startRotZ;
	
	var zoomSet : Vector3 = new Vector3(-0.141,0.18,-0.3);
	zoomPoint = transform.localPosition + zoomSet;
	
	startPosition = transform.localPosition;
	defineSwayPoints();
	if(smokeParticles)
		smokeParticles.emit = false;
	if(hitMetalParticles)
		hitMetalParticles.emit = false;
	if(hitDirtParticles)
		hitDirtParticles.emit = false;
	if(hitDirtParticles2)
		hitDirtParticles2.emit = false;
	if(hitWoodParticles)
		hitWoodParticles.emit = false;
	if(hitManParticles)
		hitManParticles.emit = false;
	bulletsLeft = bulletsPerClip;
	
	// create quad for bullethole metal
	if(makeHoles == 0)
	{
		 var mr : MeshRenderer = new MeshRenderer();
		 var m : Mesh = new Mesh();
	     m.name = "Scripted_Plane_New_Mesh";
	     m.vertices = [Vector3(-bulletHoleSize, -bulletHoleSize, 0.01), Vector3(bulletHoleSize, -bulletHoleSize, 0.01), Vector3(bulletHoleSize, bulletHoleSize, 0.01), Vector3(-bulletHoleSize, bulletHoleSize, 0.01) ];
	     m.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];
	     m.triangles = [0, 1, 2, 0, 2, 3];
	     m.RecalculateNormals();
	     if(bulletHoleMetal)
	     {
		     bulletHoleMetalObject = new GameObject("bulletHoleMetalMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleMetalObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleMetalObject.renderer.material = bulletHoleMetal;
	     }
	     
	     // create quad for bullethole dirt
	     if(bulletHoleDirt)
	     {
		     bulletHoleDirtObject = new GameObject("bulletHoleDirtMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleDirtObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleDirtObject.renderer.material = bulletHoleDirt;
		 }
	     
	     // create quad for bullethole wood
	     if(bulletHoleWood)
	     {
		     bulletHoleWoodObject = new GameObject("bulletHoleWoodMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleWoodObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleWoodObject.renderer.material = bulletHoleWood;
	     }
	     
	     // create quad for bullethole wood
	     if(bulletHoleMan)
	     {
		     bulletHoleManObject = new GameObject("bulletHoleWoodMesh", MeshRenderer, MeshFilter, MeshCollider);
		     bulletHoleManObject.GetComponent(MeshFilter).mesh = m;
		     bulletHoleManObject.renderer.material = bulletHoleMan;
	     }
	     makeHoles = 1;
     }
     
     checkAmmo();
}

function LateUpdate () {
	if(muzzleFlash)
	{
		if(m_LastFrameShot == Time.frameCount)
		{
			muzzleFlash.transform.localRotation =
				Quaternion.AngleAxis(Random.Range(0, 359), Vector3.forward);
			muzzleFlash.enabled = true;
			muzzleFlash.light.enabled = true;
			
			if(audio)
			{
				if(audio.clip.length < 1.0 || !audio.isPlaying)
					audio.PlayOneShot(audio.clip,1.0);
				audio.loop = true;
			}
		}
		else
		{
			muzzleFlash.enabled = false;
			muzzleFlash.light.enabled = false;
			enabled = false;
			
			if(audio)
			{
				audio.loop = false;
			}
		}
	}
}

function Fire()
{
	if(bulletsLeft == 0)
		return;
		
	if(GameManager.isPaused)
		return;
		
	if (nextFireTime <= Time.time && bulletsLeft > 0 && !reloading){
		direction = camTransf.forward;
		shootPositionObject = camTransf.position;
    	FireOneShot();
    	nextFireTime = Time.time + fireRate;
  	}
}

function Fire(hitPosition : Vector3)
{
	if(bulletsLeft == 0)
		return;
		
	if (!reloading){
    	FireOneShot(hitPosition);
  	}
}

function FireOneShot()
{
	var isLocalPlayer = false;
	if(thePlayer.GetComponent(FPSPlayer).isControllable)
		isLocalPlayer = true;

	var hit : RaycastHit;
	var layerMask = (1 << 0) | (1 << 8) | (1 << 11) | (1 << 13) | (1 << 14) | (1 << 25);
	var shootDirection = Vector3(direction.x+Random.Range((-accuracy)*recoil*charSpeed,accuracy*recoil*charSpeed),
	direction.y+Random.Range((-accuracy)*recoil*charSpeed,accuracy*recoil*charSpeed), direction.z);
	
	if(Physics.Raycast(shootPositionObject, shootDirection, hit, range, layerMask))
	{
		AI.StrikeFear(hit.point, damage, 0, 5.0); 
	
		if(bulletTrail)
		{
			bulletTrail.SetPosition(0, muzzleFlash.transform.position);
			bulletTrail.SetPosition(1, hit.point);
			bulletTrail.SetWidth(0.1,0.1);
			Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
		}
		
		if(hit.rigidbody)
			hit.rigidbody.AddForceAtPosition(force * direction, hit.point);
		
		if(hitMetalParticles)
		{
			if(hit.transform.GetComponent(IsMetal))
			{
				hitMetalParticles.transform.position = hit.point;
				hitMetalParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitMetalParticles.Emit();
				if(bulletHoleMetal && !hit.transform.GetComponent(Rigidbody))
				     Instantiate(bulletHoleMetalObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitDirtParticles && hitDirtParticles2)
		{
			if(hit.transform.GetComponent(IsGround))
			{
				//Terrain.activeTerrain.GetComponent(cratermaker).makeCrater(hit.point); //make crater in ground
				audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
				hitDirtParticles.transform.position = hit.point;
				hitDirtParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles.Emit();
				hitDirtParticles2.transform.position = hit.point;
				hitDirtParticles2.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles2.Emit();
				if(bulletHoleDirt)
				     Instantiate(bulletHoleDirtObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitWoodParticles)
		{
			if(hit.transform.GetComponent(IsWood))
			{
				audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
				hitWoodParticles.transform.position = hit.point;
				hitWoodParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitWoodParticles.Emit();
				if(bulletHoleWood)
				     Instantiate(bulletHoleWoodObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitManParticles)
		{
			if(!hit.transform.GetComponent(IsMetal) && (hit.transform.GetComponent(IsMan) || hit.transform.root.GetComponent(IsMan)))
			{
				audio.PlayClipAtPoint(manImpact, hit.point, 1);
				hitManParticles.transform.position = hit.point;
				hitManParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitManParticles.Emit();
				if(bulletHoleMan)
				     Instantiate(bulletHoleManObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
				var hitMan : RaycastHit;
				var layerMaskMan = (1 << 0) | (1 << 13);
				if(Physics.Raycast(shootPositionObject, shootDirection, hitMan, range, layerMaskMan))
				{
					var bloodSplatter : GameObject = Instantiate(splat, hitMan.point + (hitMan.normal*0.1), Quaternion.FromToRotation(Vector3.up, hitMan.normal));
					bloodSplatter.transform.localScale = Vector3(Random.Range(0.3,1.0),1,Random.Range(0.3,1.0));
				}
			}
		}
		
		if(smokeParticles)
		{
			smokeParticles.Emit();
		}
		
		if(hit.transform.GetComponent(IsMan))
		{
			if(hit.transform.parent.GetComponent(AI))
			{
				hit.transform.parent.GetComponent(CharacterDamage).ApplyDamage(damage);
			} else {
				hit.transform.parent.GetComponent(FPSPlayer).ApplyDamage(damage);
			}
		}
		
		thePlayer.SendMessage("NetworkFire", hit.point, SendMessageOptions.DontRequireReceiver);
		yield;
	}
	else
	{
		if(bulletTrail)
		{
			bulletTrail.SetPosition(0, muzzleFlash.transform.position);
			bulletTrail.SetPosition(1, shootPositionObject+(direction*range));
			bulletTrail.SetWidth(0.1,0.1);
			Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
		}
		thePlayer.SendMessage("NetworkFire", shootPositionObject+(direction*range), SendMessageOptions.DontRequireReceiver);
		yield;
	}
	
	bulletsLeft--;
	
	recoil += recoilRate;
	currentRotX -= recoilRate;
	camTransf.parent.GetComponent(CameraShake).Shake(recoilRate);
	
	m_LastFrameShot = Time.frameCount;
	enabled = true;
	
	if(bulletsLeft == 0)
		Reload();
		
}

function FireOneShot(hitPosition : Vector3)
{
	if(bulletTrail)
	{
		bulletTrail.SetPosition(0, muzzleFlash.transform.position);
		bulletTrail.SetPosition(1, hitPosition);
		bulletTrail.SetWidth(0.1,0.1);
		Instantiate(bulletTrail, muzzleFlash.transform.position, transform.rotation);
	}
	
	//if(hit.rigidbody)
		//hit.rigidbody.AddForceAtPosition(force * direction, hit.point);
		
	
	var hit : RaycastHit;
	var layerMask = (1 << 0) | (1 << 8) | (1 << 11) | (1 << 13) | (1 << 14) | (1 << 25);
		
	if(Physics.Raycast(transform.position, (hitPosition-transform.position).normalized, hit, layerMask))
	{
		AI.StrikeFear(hit.point, damage, 0, 3.0); 
		
		if(hitMetalParticles)
		{
			if(hit.transform.GetComponent(IsMetal))
			{
				hitMetalParticles.transform.position = hit.point;
				hitMetalParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitMetalParticles.Emit();
				if(bulletHoleMetal && !hit.transform.GetComponent(Rigidbody))
				     Instantiate(bulletHoleMetalObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitDirtParticles && hitDirtParticles2)
		{
			if(hit.transform.GetComponent(IsGround))
			{
				//Terrain.activeTerrain.GetComponent(cratermaker).makeCrater(hit.point); //make crater in ground
				audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
				hitDirtParticles.transform.position = hit.point;
				hitDirtParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles.Emit();
				hitDirtParticles2.transform.position = hit.point;
				hitDirtParticles2.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitDirtParticles2.Emit();
				if(bulletHoleDirt)
				     Instantiate(bulletHoleDirtObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitWoodParticles)
		{
			if(hit.transform.GetComponent(IsWood))
			{
				audio.PlayClipAtPoint(dirtImpact, hit.point, 1);
				hitWoodParticles.transform.position = hit.point;
				hitWoodParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitWoodParticles.Emit();
				if(bulletHoleWood)
				     Instantiate(bulletHoleWoodObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
			}
		}
		if(hitManParticles)
		{
			if(!hit.transform.GetComponent(IsMetal) && (hit.transform.GetComponent(IsMan) || hit.transform.root.GetComponent(IsMan)))
			{
				audio.PlayClipAtPoint(manImpact, hit.point, 1);
				hitManParticles.transform.position = hit.point;
				hitManParticles.transform.rotation =
					Quaternion.FromToRotation(Vector3.up, hit.normal);
				hitManParticles.Emit();
				if(bulletHoleMan)
				     Instantiate(bulletHoleManObject,hit.point,Quaternion.FromToRotation(Vector3.forward, hit.normal));
				var shootDirection = (hit.point - shootPositionObject).normalized;
				var hitMan : RaycastHit;
				var layerMaskMan = (1 << 0) | (1 << 13);
				if(Physics.Raycast(shootPositionObject, shootDirection, hitMan, range, layerMaskMan))
				{
					var bloodSplatter : GameObject = Instantiate(splat, hitMan.point + (hitMan.normal*0.1), Quaternion.FromToRotation(Vector3.up, hitMan.normal));
					bloodSplatter.transform.localScale = Vector3(Random.Range(0.3,1.0),1,Random.Range(0.3,1.0));
				}
			}
		}
		
		if(smokeParticles)
		{
			smokeParticles.Emit();
		}
		
		if(hit.transform.GetComponent(IsMan))
		{
			if(hit.transform.parent.GetComponent(AI))
			{
				hit.transform.parent.GetComponent(CharacterDamage).ApplyDamage(damage);
			} else {
				hit.transform.parent.GetComponent(FPSPlayer).ApplyDamage(damage);
			}
		}
	}
	
	m_LastFrameShot = Time.frameCount;
	enabled = true;
}

function Reload()
{
	if(ammo <= 0 || bulletsLeft == bulletsPerClip)
		return;
	reloading = true;
	thePlayer.SendMessage("NetworkReload", reloading, SendMessageOptions.DontRequireReceiver);
	if(reloadSound)
		reloadSound.Play();
	var tempWeapons : PlayerWeapons = transform.parent.GetComponent(PlayerWeapons);
	tempWeapons.switchTime = reloadTime;
	tempWeapons.SelectWeapon(tempWeapons.ActiveGun, true);
	yield WaitForSeconds(reloadTime);
	reloading = false;
	thePlayer.SendMessage("NetworkReload", reloading, SendMessageOptions.DontRequireReceiver);
	
	if(bulletsLeft > 0 && ammo >= bulletsPerClip-bulletsLeft)
	{
		ammo -= findAmmo(bulletsPerClip-bulletsLeft);
		bulletsLeft += bulletsPerClip-bulletsLeft;
	}
	else if(bulletsLeft > 0 && ammo < bulletsPerClip-bulletsLeft)
	{
		bulletsLeft += findAmmo(ammo);
		ammo = 0;
	}
	else if(ammo >= bulletsPerClip)
	{
		bulletsLeft = bulletsPerClip;
		ammo -= findAmmo(bulletsPerClip);
	}
	else
	{
		bulletsLeft = findAmmo(bulletsPerClip);
		ammo = 0;
	}
}

function NetReload()
{
	if(ammo <= 0 || bulletsLeft == bulletsPerClip)
		return;
	if(reloadSound)
		reloadSound.Play();
		
	if(bulletsLeft > 0 && ammo >= bulletsPerClip-bulletsLeft)
	{
		ammo -= findAmmo(bulletsPerClip-bulletsLeft);
		bulletsLeft += bulletsPerClip-bulletsLeft;
	}
	else if(bulletsLeft > 0 && ammo < bulletsPerClip-bulletsLeft)
	{
		bulletsLeft += findAmmo(ammo);
		ammo = 0;
	}
	else if(ammo >= bulletsPerClip)
	{
		bulletsLeft = bulletsPerClip;
		ammo -= findAmmo(bulletsPerClip);
	}
	else
	{
		bulletsLeft = findAmmo(bulletsPerClip);
		ammo = 0;
	}
}

function GetBulletsLeft()
{
	return bulletsLeft;
}
function GetAmmoLeft()
{
	return ammo;
}
function GetClipSize()
{
	return bulletsPerClip;
}
function GetBulletWidth()
{
	return bulletWidth;
}
function GetBulletHeight()
{
	return bulletHeight;
}

function walkSway () 
{
	if(!zooming)
	{
		if(swayDown == true) {
	        currentRotX = startRotX + (walkjiggle*Mathf.Abs((transform.localPosition.x-midSway.x)/(walkSway1.x-midSway.x)));
			currentRotX = Mathf.Clamp(currentRotX,startRotX-endRotX,endRotX);
		} else if(swayDown == false) {
		    currentRotX = endRotX - (walkjiggle*(1-Mathf.Abs((transform.localPosition.x-midSway.x)/(walkSway1.x-midSway.x))));
			currentRotX = Mathf.Clamp(currentRotX,startRotX-endRotX,endRotX);
		}
		
	    if(swayTarget == 1)
	    {    
		    if(transform.localPosition.x > midSway.x) {
		    	if(resetTime)
					startTime = Time.time;
	            resetTime = false;
				swayDown = true;
			}
	            //swayTarget is which of the two points I'm going towards
	         if (Vector3.Distance(transform.localPosition, walkSway1) >= 0.08){
	            curVect = walkSway1 - transform.localPosition;
	                     //if the gun isn't at sway point one, transform towards it (the speed at which it transforms depends on the speed of the player) .
	            transform.Translate(curVect*Time.deltaTime*swayRate,Space.Self);
	        } else {
	                    //if it has reached sway point 1, start going towards sway point 2 
				swayDown = false;
	            startTime = Time.time;
	            swayTarget = 2;
	            resetTime = true;
	        }
	        
	    } else if(swayTarget == 2) {
		    if(transform.localPosition.x < midSway.x) {
		    	if(resetTime)
					startTime = Time.time;
	            resetTime = false;
				swayDown = true;
			}
	        if (Vector3.Distance(transform.localPosition, walkSway2) >= 0.08){
	            curVect = walkSway2 - transform.localPosition;
	                            // curVect is just the temporary vector for the translation
	            transform.Translate(curVect*Time.deltaTime*swayRate,Space.Self);
	        } else {
				swayDown = false;
	       	 	startTime = Time.time;
	            swayTarget = 1;
	            resetTime = true;
	        }
	    }
    }
}

function lookSway(mouseSpeedX : float, mouseSpeedY : float)
{
	if(!zooming) {
		currentRotY -= mouseSpeedX/10;
		currentRotY = Mathf.Clamp(currentRotY,startRotY-endRotY,endRotY);
		currentRotX += mouseSpeedY/10;
		currentRotX = Mathf.Clamp(currentRotX,startRotX-endRotX,endRotX);
		currentRotZ += mouseSpeedX/10;
		currentRotZ += mouseSpeedY/10;
		currentRotZ = Mathf.Clamp(currentRotZ,startRotZ-endRotZ,endRotZ);
		transform.localRotation = Quaternion.Euler(currentRotX,currentRotY,currentRotZ);
	}
}
function defineSwayPoints () 
{
	swayFactor = new Vector3(0.1,0,0);
    walkSway1 = transform.localPosition + swayFactor;
    walkSway2 = transform.localPosition - swayFactor;
    midSway = (walkSway1 + walkSway2)/2;
}
function resetPosition () 
{
     if (!zooming && Vector3.Distance(transform.localPosition, startPosition) >= 0.08)
     {
        curVect= startPosition - transform.localPosition;
        transform.Translate(curVect*Time.deltaTime*2,Space.Self);
     }
}
function resetRotation()
{
	recoil = (recoil-((recoil-baseRecoil)/20));
	currentRotY = (currentRotY - startRotationY)/1.1;
	currentRotX = (currentRotX - startRotationX)/1.1;
	currentRotZ = (currentRotZ - startRotationZ)/1.1;
	transform.localRotation = Quaternion.Euler(currentRotX,currentRotY,currentRotZ);
}

function zoomIn()
{
	var tempAccuracy = accuracy;
	accuracy = 0;
	zooming = true;
	while(zooming == true)
	{
		//startPosZ = (currentPosZ - startPosZ)/1.5;
		//startPosX = (currentPosX - startPosX)/1.5;
		//transform.localPosition = Vector3(startPositionX,startPositionY,transform.localPosition.z);
		if (Vector3.Distance(transform.localPosition, zoomPoint) >= 0.001)
		{
            //Debug.Log(Vector3.Distance(transform.localPosition, zoomPoint));
            curVect = zoomPoint - transform.localPosition;
                     //if the gun isn't at sway point one, transform towards it (the speed at which it transforms depends on the speed of the player) .
            transform.Translate(curVect*Time.deltaTime*10,Space.Self);
        }
		yield;
	}
	accuracy = tempAccuracy;
}
function zoomOut()
{
	zooming = false;
}
function changeJiggle(change : float, sprint : boolean)
{
	if(sprint) {
		startRotX += Time.deltaTime*15;
		startRotX = Mathf.Clamp(startRotX,storedRotX,storedRotX+15);
	} else {
		startRotX -= Time.deltaTime*15;
		startRotX = Mathf.Clamp(startRotX,storedRotX,storedRotX+15);
	}
	if(change > 15) {
		walkjiggle = change;
		endRotX = startRotX+walkjiggle;
	} else {
		walkjiggle = 15;
		endRotX = startRotX+15;
	}
}

function checkAmmo()
{
	var count : int = 0;
	var tempInv : InventoryItem[] = GameObject.Find("InventoryManager").GetComponent(Inventory).inventory;
	for(var i=0; i<tempInv.length; i++) {
		if(tempInv[i] == null)
			continue;
		if( tempInv[i].slotType == SlotType.Ammo) {
			if(tempInv[i].itemName == ammoType) {
				count += tempInv[i].stackSize;
			}
		}
	}
	ammo = count;
}

function findAmmo(numAmmo : int)
{
	var remainingAmmo = numAmmo;
	var tempInv : InventoryItem[] = GameObject.Find("InventoryManager").GetComponent(Inventory).inventory;
	for(var i=0; i<tempInv.length; i++) {
		if(tempInv[i] != null && tempInv[i].slotType == SlotType.Ammo && tempInv[i].itemName == ammoType) {
			if(remainingAmmo >= tempInv[i].stackSize) {
				remainingAmmo -= tempInv[i].stackSize;
				tempInv[i] = null;
			} else if(remainingAmmo > 0) {
				tempInv[i].stackSize -= remainingAmmo;
				remainingAmmo = 0;
			}
		}
	}
	return numAmmo - remainingAmmo;
}