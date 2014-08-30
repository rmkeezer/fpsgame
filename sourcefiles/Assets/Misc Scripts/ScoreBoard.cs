using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class ScoreBoard : MonoBehaviour {
	
	bool showBoard = true;
	string scoreBoardText = "";
    private Vector2 scrollPos = Vector2.zero;
	
	private void OnGUI()
	{
		if(showBoard) {
		GUI.skin.box.fontStyle = FontStyle.Bold;
	        GUI.Box(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300), "Scoreboard");
	        GUILayout.BeginArea(new Rect((Screen.width - 400) / 2, (Screen.height - 350) / 2, 400, 300));
	
	        GUILayout.Space(25);	
			
			this.scrollPos = GUILayout.BeginScrollView(this.scrollPos);
	        foreach(PhotonPlayer player in PhotonNetwork.playerList)
	        {
	            GUILayout.BeginHorizontal();
	            GUILayout.Label(player.name + " | Kills: " + (int)player.customProperties["kills"] + " | Deaths: " + (int)player.customProperties["deaths"] + " | ");
	            if (PhotonNetwork.isMasterClient && GUILayout.Button("Kick"))
	            {
	               	PhotonNetwork.CloseConnection(player);
				}
	            GUILayout.EndHorizontal();
	        }
	
	        GUILayout.EndScrollView();
	
	        GUILayout.EndArea();
		}
	}
	
	public void ShowBoard(bool show)
	{
		showBoard = show;
	}
}
