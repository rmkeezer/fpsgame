using UnityEngine;
using System.Collections;

public class RagdollNetwork : Photon.MonoBehaviour
{
    public bool inventoryChanged = false;
	public int[] inventoryContent;
	public string unitName = "NO NAME SET";
	public int experience = 0;
	public int age = 0;
	public int height = 0;
	public int weight = 0;
	
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
        }
        else
        {
			
        }

        gameObject.name = gameObject.name + photonView.viewID;
    }

    void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info)
    {
        if (stream.isWriting)
        {
            //We own this player: send the others our data
			/*stream.SendNext(inventoryChanged);
			if(inventoryChanged) {
				stream.SendNext(inventoryContent);
				inventoryChanged = false;
			}*/
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
			/*if((bool)stream.ReceiveNext()) {
				SendMessage("UpdateNetworkInventory", (int[])stream.ReceiveNext());
			}*/
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
	
	/*public void NetworkLoot(int[] content)
	{
		inventoryContent = content;
		inventoryChanged = true;
	}*/
	
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