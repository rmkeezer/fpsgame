using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// This simple chat example showcases the use of RPC targets and targetting certain players via RPCs.
/// </summary>
public class Chat : Photon.MonoBehaviour
{

    public static Chat SP;
    public List<string> messages = new List<string>();

    private int chatHeight = Screen.height/3;
    private Vector2 scrollPos = Vector2.zero;
    private string chatInput = "";
	
	public bool show = false;

    void Awake()
    {
        SP = this;
    }

    void OnGUI()
    {
		if(show)
		{
			GUI.skin.box.fontStyle = FontStyle.Bold;
	        GUI.Box(new Rect(0, (Screen.height - chatHeight) , Screen.width/3, chatHeight), "");
			
		}
		
        GUILayout.BeginArea(new Rect(0, Screen.height - chatHeight, Screen.width/3, chatHeight));
		
        //Show scroll list of chat messages
		if(show)
        	scrollPos = GUILayout.BeginScrollView(scrollPos);
        GUI.color = Color.black;
        for (int i = messages.Count - 1; i >= 0; i--)
        {
            GUILayout.Label(messages[i]);
		}
		if(show)
        	GUILayout.EndScrollView();
        GUI.color = Color.white;
		
		if(show)
		{
	        //Chat input
	        chatInput = GUILayout.TextField(chatInput);
	
	        //Group target buttons
	        GUILayout.BeginHorizontal();
	        GUI.color = Color.black; GUILayout.Label("Send to:", GUILayout.Width(60)); GUI.color = Color.white;
	        if (GUILayout.Button("ALL", GUILayout.Height(17)))
	            SendChat(PhotonTargets.All);
	        if (GUILayout.Button("TO HOST", GUILayout.Height(17)))
	            SendChat(PhotonTargets.MasterClient);
	        GUILayout.EndHorizontal();
	
	        //Player target buttons
	        GUILayout.BeginHorizontal();
	        GUI.color = Color.black; GUILayout.Label("Send to:", GUILayout.Width(60)); GUI.color = Color.white;
	        foreach (PhotonPlayer player in PhotonNetwork.playerList)
	            if (GUILayout.Button("" + player, GUILayout.MaxWidth(100), GUILayout.Height(17)))
	                SendChat(player);
	        GUILayout.EndHorizontal();
		}
	    GUILayout.EndArea();
    }

    public static void AddMessage(string text)
    {
        SP.messages.Add(text);
        if (SP.messages.Count > 15)
            SP.messages.RemoveAt(0);
    }
	
	public void ShowChat(bool show)
	{
		this.show = show;	
	}


    [RPC]
    void SendChatMessage(string text, PhotonMessageInfo info)
    {
        AddMessage("[" + info.sender + "] " + text);
    }

    void SendChat(PhotonTargets target)
    {
        photonView.RPC("SendChatMessage", target, chatInput);
        chatInput = "";
    }

    void SendChat(PhotonPlayer target)
    {
        chatInput = "[PM] " + chatInput;
        photonView.RPC("SendChatMessage", target, chatInput);
        chatInput = "";
    }
}
