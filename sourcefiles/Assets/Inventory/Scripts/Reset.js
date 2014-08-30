function OnGUI () {
	if (GUI.Button (Rect (190,10,100,30), "RESET")) {
		Application.LoadLevel (Application.loadedLevel);
	}
}