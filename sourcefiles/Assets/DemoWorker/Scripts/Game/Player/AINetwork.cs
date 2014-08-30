using UnityEngine;
using System.Collections;

public class AINetwork : Photon.MonoBehaviour
{
	public AINetworkAnimation animationScript;
	public bool fire = false;
	public bool dead = false;
	public int nwObjectiveWaypoint = 0;
	public int nwCurWayPoint = 0;
	public Vector3 networkHit = Vector3.zero;
	public string unitName = "NO NAME SET";
	public int experience = 0;
	public int age = 0;
	public int height = 0;
	public int weight = 0;

    private Vector3 correctPlayerPos = Vector3.zero; //We lerp towards this
    private Quaternion correctPlayerRot = Quaternion.identity; //We lerp towards this
	
	private bool notDetonated = true;
	private bool editProfile = false;
	private bool updateName = false;
	private bool updateXP = false;
	private bool updateAge = false;
	private bool updateHeight = false;
	private bool updateWeight = false;

    void Awake()
    {
		
        if (photonView.isMine)
        {
            //MINE: local player, simply enable the local scripts
			SendMessage("SetIsLocal", true, SendMessageOptions.DontRequireReceiver);
        }
        else
        {
			SendMessage("DisableAI", true, SendMessageOptions.DontRequireReceiver);
            //cameraController.active = false;
			//cameraController.transform.FindChild("MainCamera").active = false;
			//cameraController.transform.FindChild("MainCamera").FindChild("GunCamera").active = false;
			
            //controllerScript.isControllable = false;
			//gameObject.tag = "OtherPlayer";
        }

        gameObject.name = gameObject.name + photonView.viewID;
    }

    void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info)
    {
        if (stream.isWriting)
        {
            //We own this player: send the others our data
            stream.SendNext((int)animationScript._characterState);
            stream.SendNext(transform.position);
            stream.SendNext(transform.rotation);
			stream.SendNext(fire);
			if(fire) {
				fire = false;
				stream.SendNext(networkHit);
			}
			stream.SendNext(dead);
			stream.SendNext(editProfile);
			if(editProfile) {
				stream.SendNext(updateName);
				if(updateName) {
					stream.SendNext(unitName);
					updateName = false;
				}
				stream.SendNext(updateXP);
				if(updateXP) {
					stream.SendNext(experience);
					updateXP = false;
				}
				stream.SendNext(updateAge);
				if(updateAge) {
					stream.SendNext(age);
					updateAge = false;
				}
				stream.SendNext(updateHeight);
				if(updateHeight) {
					stream.SendNext(height);
					updateHeight = false;
				}
				stream.SendNext(updateWeight);
				if(updateWeight) {
					stream.SendNext(weight);
					updateWeight = false;
				}
			}
        }
        else
        {
            //Network player, receive data
            animationScript._characterState = (CharacterState)(int)stream.ReceiveNext();
			correctPlayerPos = (Vector3)stream.ReceiveNext();
            correctPlayerRot = (Quaternion)stream.ReceiveNext();
			if((bool)stream.ReceiveNext())
				SendMessage("Shoot", (Vector3)stream.ReceiveNext());
			if((bool)stream.ReceiveNext()) {
				if(notDetonated) {
					transform.position = correctPlayerPos;
					transform.rotation = correctPlayerRot;
					SendMessage("Detonate");
					notDetonated = false;
				}
			}
			if((bool)stream.ReceiveNext()) {
				if((bool)stream.ReceiveNext()) {
					unitName = (string)stream.ReceiveNext();
					SendMessage("ChangeName", unitName);
					updateName = false;
				}
				if((bool)stream.ReceiveNext()) {
					experience = (int)stream.ReceiveNext();
					SendMessage("ChangeXP", experience);
					SendMessage("UpdateRank");
					updateXP = false;
				}
				if((bool)stream.ReceiveNext()) {
					age = (int)stream.ReceiveNext();
					SendMessage("ChangeAge", age);
					updateAge = false;
				}
				if((bool)stream.ReceiveNext()) {
					height = (int)stream.ReceiveNext();
					SendMessage("ChangeHeight", height);
					updateHeight = false;
				}
				if((bool)stream.ReceiveNext()) {
					weight = (int)stream.ReceiveNext();
					SendMessage("ChangeWeight", weight);
					updateWeight = false;
				}
			}
        }
    }

    void Update()
    {
        if (!PhotonNetwork.isMasterClient && correctPlayerPos != Vector3.zero)
        {
            //Update remote player (smooth this, this looks good, at the cost of some accuracy)
            transform.position = Vector3.Slerp(transform.position, correctPlayerPos, Time.deltaTime * 10);
            transform.rotation = Quaternion.Slerp(transform.rotation, correctPlayerRot, Time.deltaTime * 10);
        }
    }
	
	public bool IsFiring()
	{
		return fire;
	}
	
	public void NetworkFire()
	{
		fire = true;
	}
	
	public void NetworkHit(Vector3 hit)
	{
		networkHit = hit;	
	}
	
	public void NetworkDead(bool isDead)
	{
		dead = isDead;
	}
	
	public void SetObj(int obj)
	{
		nwObjectiveWaypoint = obj;	
	}
	
	public void SetCur(int cur)
	{
		nwCurWayPoint = cur;	
	}
	
	public void NetworkName(string name)
	{
		unitName = name;
		editProfile = true;
		updateName = true;
	}
	public void NetworkXP(int exp)
	{
		experience = exp;
		editProfile = true;
		updateXP = true;
	}
	public void NetworkAge(int a)
	{
		age = a;
		editProfile = true;
		updateAge = true;
	}
	public void NetworkHeight(int h)
	{
		height = h;
		editProfile = true;
		updateHeight = true;
	}
	public void NetworkWeight(int w)
	{
		weight = w;
		editProfile = true;
		updateWeight = true;
	}
}