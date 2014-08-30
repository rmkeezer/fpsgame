using System.Collections;
using UnityEngine;

public class GameManager : Photon.MonoBehaviour
{
    public Transform playerPrefab;
	private GameObject germans;
	private GameObject americans;
	private GameObject vehicles;
	private bool notStarted = true;
	public GameObject scoreBoard;

    public void Awake()
    {
        // PhotonNetwork.logLevel = NetworkLogLevel.Full;
        if (!PhotonNetwork.connected)
        {
            // We must be connected to a photon server! Back to main menu
            Application.LoadLevel(Application.loadedLevel - 1);
            return;
        }
		
		PhotonNetwork.isMessageQueueRunning = true;
		
		germans = GameObject.Find("trenches_german");
		americans = GameObject.Find("trenches_america");
		vehicles = GameObject.Find("trenches_vehicles");
		germans.SetActiveRecursively(false);
		americans.SetActiveRecursively(false);
		vehicles.SetActiveRecursively(false);
    }
	
	private void Start()
	{
		GameObject.Find("_GameManager").SendMessage("EscapePressed");
		Destroy(GameObject.Find("LobbyCamera"));
   		PhotonNetwork.Instantiate(this.playerPrefab.name, transform.position, Quaternion.identity, 0).SendMessage("SetIsControl", false);
		Screen.showCursor = true;
		Hashtable score = new Hashtable();
        score.Add("deaths", 0);
        score.Add("kills", 0);
		PhotonNetwork.player.SetCustomProperties(score);
		Instantiate(scoreBoard);
	}

    public void OnGUI()
    {
        if (GUILayout.Button("Return to Lobby"))
        {
            PhotonNetwork.LeaveRoom();
        }
		if (notStarted && PhotonNetwork.isMasterClient && GUILayout.Button("Start Game"))
        {
            PhotonNetwork.Instantiate("GameStart", transform.position, Quaternion.identity, 0);
			notStarted = false;
			Screen.showCursor = false;
        }
    }

    public void OnLeftRoom()
    {
        Debug.Log("OnLeftRoom (local)");
        
        // back to main menu        
        Application.LoadLevel(Application.loadedLevelName);
    }

    public void OnMasterClientSwitched(PhotonPlayer player)
    {
        Debug.Log("OnMasterClientSwitched: " + player);

        if (PhotonNetwork.connected)
        {
            photonView.RPC("SendChatMessage", PhotonNetwork.masterClient, "Hi master! From:" + PhotonNetwork.player);
            photonView.RPC("SendChatMessage", PhotonTargets.All, "WE GOT A NEW MASTER: " + player + "==" + PhotonNetwork.masterClient + " From:" + PhotonNetwork.player);
        }
    }

    public void OnDisconnectedFromPhoton()
    {
        Debug.Log("OnDisconnectedFromPhoton");

        // Back to main menu        
        Application.LoadLevel(Application.loadedLevelName);
    }

    public void OnPhotonPlayerConnected(PhotonPlayer player)
    {
        Debug.Log("OnPhotonPlayerConnected: " + player);
    }

    public void OnPhotonPlayerDisconnected(PhotonPlayer player)
    {
        Debug.Log("OnPlayerDisconneced: " + player);
    }

    public void OnReceivedRoomList()
    {
        Debug.Log("OnReceivedRoomList");
    }

    public void OnReceivedRoomListUpdate()
    {
        Debug.Log("OnReceivedRoomListUpdate");
    }

    public void OnConnectedToPhoton()
    {
        Debug.Log("OnConnectedToPhoton");
    }

    public void OnFailedToConnectToPhoton()
    {
        Debug.Log("OnFailedToConnectToPhoton");
    }

    public void OnPhotonInstantiate(PhotonMessageInfo info)
    {
        Debug.Log("OnPhotonInstantiate " + info.sender);
    }
}
