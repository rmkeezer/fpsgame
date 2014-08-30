using UnityEngine;
using System.Collections;

public class ThirdPersonNetwork : Photon.MonoBehaviour
{
    ThirdPersonController controllerScript;
	public GameObject cameraController;
	public int currentGun = 0;
	public bool reloading = false;
	public bool hasStartedReloading = false;
	public bool fire = false;
	public bool dead = false;
	public bool grenade = false;
	public GameObject aimLookObject;
	public Vector3 currentPoint;
	private Vector3 hitPosition;

    private Vector3 correctPlayerPos = Vector3.zero; //We lerp towards this
    private Quaternion correctPlayerRot = Quaternion.identity; //We lerp towards this
	
	public bool inventoryChanged = false;
	public int[] inventoryContent;
	public int[] inventoryStackContent;
	public string inventoryObjectName = "";
	
	public bool destroyItem = false;
	public string itemName = "";
	
	public bool netCol = true;
	private bool tempNetCol = true;

    void Awake()
    {
        controllerScript = GetComponent<ThirdPersonController>();

         if (photonView.isMine)
        {
            //MINE: local player, simply enable the local scripts
			SendMessage("SetIsControl", true, SendMessageOptions.DontRequireReceiver);
        }
        else
        {
            cameraController.active = false;
			cameraController.transform.FindChild("MainCamera").active = false;
			cameraController.transform.FindChild("MainCamera").FindChild("GunCamera").active = false;
			SendMessage("SetIsControl", false, SendMessageOptions.DontRequireReceiver);
            controllerScript.isControllable = false;
			gameObject.tag = "OtherPlayer";
        }

        gameObject.name = gameObject.name + photonView.viewID;
    }

    void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info)
    {
        if (stream.isWriting)
        {
            //We own this player: send the others our data
            stream.SendNext((int)controllerScript._characterState);
            stream.SendNext(transform.position);
            stream.SendNext(transform.rotation);
			stream.SendNext(currentGun);
			stream.SendNext(cameraController.transform.position + (cameraController.transform.forward*100.0f));
			stream.SendNext(hitPosition);
			stream.SendNext(reloading);
			stream.SendNext(fire);
			if(fire)
				fire = false;
			stream.SendNext(dead);
			stream.SendNext(grenade);
			if(grenade)
				grenade = false;
			stream.SendNext(inventoryChanged);
			if(inventoryChanged) {
				stream.SendNext(inventoryObjectName);
				stream.SendNext(inventoryStackContent);
				stream.SendNext(inventoryObjectName);
				stream.SendNext(inventoryContent);
				inventoryChanged = false;
			}
			stream.SendNext(destroyItem);
			if(destroyItem) {
				stream.SendNext(itemName);
				destroyItem = false;
			}
			stream.SendNext(netCol);
        }
        else
        {
            //Network player, receive data
            controllerScript._characterState = (CharacterState)(int)stream.ReceiveNext();
			correctPlayerPos = (Vector3)stream.ReceiveNext();
            correctPlayerRot = (Quaternion)stream.ReceiveNext();
			currentGun = (int)stream.ReceiveNext();
			currentPoint = (Vector3)stream.ReceiveNext();
			hitPosition = (Vector3)stream.ReceiveNext();
			reloading = (bool)stream.ReceiveNext();
			if(reloading && !hasStartedReloading)
				SendMessage ("Reload");
			hasStartedReloading = reloading;
			if((bool)stream.ReceiveNext() && !reloading)
				SendMessage("Fire", hitPosition, SendMessageOptions.DontRequireReceiver);
			SendMessage("SetPlayerGun", currentGun, SendMessageOptions.DontRequireReceiver);
			currentPoint.y -= 20f;
			if((bool)stream.ReceiveNext())
				SendMessage("SetNetworkDead");
			if((bool)stream.ReceiveNext())
				SendMessage ("ThrowNetworkGrenade");
			if((bool)stream.ReceiveNext()) {
				GameObject.Find((string)stream.ReceiveNext()).SendMessage("UpdateNetworkStackContent", (int[])stream.ReceiveNext());
				GameObject.Find((string)stream.ReceiveNext()).SendMessage("UpdateNetworkInventory", (int[])stream.ReceiveNext());
			}
			if((bool)stream.ReceiveNext()) {
				GameObject.Find((string)stream.ReceiveNext()).SendMessage("DestroyItem");	
			}
			tempNetCol = (bool)stream.ReceiveNext();
			if(tempNetCol != netCol) {
				netCol = tempNetCol;
				GetComponent<CharacterController>().enabled = netCol;
			}
				
        }
    }

    void Update()
    {
        if (!photonView.isMine && correctPlayerPos != Vector3.zero)
        {
            //Update remote player (smooth this, this looks good, at the cost of some accuracy)
            transform.position = Vector3.Slerp(transform.position, correctPlayerPos, Time.deltaTime * 5);
            transform.rotation = Quaternion.Slerp(transform.rotation, correctPlayerRot, Time.deltaTime * 5);
        }
    }
	
	void LateUpdate()
	{
		if (!photonView.isMine && currentPoint != Vector3.zero)
        {
			Quaternion tempRotation = Quaternion.LookRotation(aimLookObject.transform.parent.position - currentPoint);
			tempRotation.eulerAngles = new Vector3(tempRotation.eulerAngles.x, tempRotation.eulerAngles.y, tempRotation.eulerAngles.z - 90f);
			aimLookObject.SendMessage("UpdateRotation", tempRotation);
		}
	}
	
	public void SetGun(int gun)
	{
		currentGun = gun;		
	}
	
	public bool IsFiring()
	{
		return fire;	
	}
	
	public void NetworkFire(Vector3 hitPosition)
	{
		this.hitPosition = hitPosition;
		fire = true;
	}
	
	public void NetworkReload(bool reload)
	{
		reloading = reload;	
	}
	
	public void SetDead(bool isDead)
	{
		dead = isDead;
	}
	
	public void NetworkGrenade()
	{
		grenade = true;
	}
	
	public void NetworkReverseLoot(int[] content)
	{
		inventoryContent = content;
		inventoryChanged = true;
	}
	
	public void NetworkReverseLootObject(string objName)
	{
		inventoryObjectName = objName;
	}
	
	public void NetworkReverseLootStack(int[] stackContent)
	{
		inventoryStackContent = stackContent;
	}
	
	public void NetworkDestroyItem(string name)
	{
		itemName = name;
		destroyItem = true;
	}
	
	public void NetworkCollision(bool col)
	{
		netCol = col;	
	}
}