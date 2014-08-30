using UnityEngine;
using System.Collections;

public class TruckNetwork : Photon.MonoBehaviour
{
	
    private Vector3 correctPlayerPos = Vector3.zero; //We lerp towards this
    private Quaternion correctPlayerRot = Quaternion.identity; //We lerp towards this
	
    void Awake()
    {
		
        if (photonView.isMine)
        {
            //MINE: local player, simply enable the local scripts
        }
        else
        {
			
        }
    }

    void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info)
    {
        if (stream.isWriting)
        {
            stream.SendNext(transform.position);
            stream.SendNext(transform.rotation);
        }
        else
        {
			correctPlayerPos = (Vector3)stream.ReceiveNext();
            correctPlayerRot = (Quaternion)stream.ReceiveNext();
        }
    }
	
	void Update()
    {
        if (!PhotonNetwork.isMasterClient && correctPlayerPos != Vector3.zero)
        {
            //Update remote player (smooth this, this looks good, at the cost of some accuracy)
            transform.position = Vector3.Slerp(transform.position, correctPlayerPos, Time.deltaTime * 5);
            transform.rotation = Quaternion.Slerp(transform.rotation, correctPlayerRot, Time.deltaTime * 5);
        }
    }
}