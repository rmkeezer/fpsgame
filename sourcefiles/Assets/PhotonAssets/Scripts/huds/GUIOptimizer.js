class GUIOptimizer extends MonoBehaviour
{
	public var hudWeapons : HudWeapons;
	public var mainMenu : MainMenuScreen;
	public var sarge : SargeManager;
	public var achievements : AchievmentScreen;
	private var isMultiplayer : boolean = false;

	function Start()
	{
		if(PlayerPrefs.GetInt("IsMultiplayer") == 1)
			isMultiplayer = true;
	}

	function OnGUI()
	{
		var evt : Event = Event.current;
		
		if(mainMenu != null && isMultiplayer) mainMenu.DrawGUI(evt);

        if(achievements != null) achievements.DrawGUI(evt);

		if(evt.type == EventType.Repaint)
		{
			if(hudWeapons != null) hudWeapons.DrawGUI(evt);
			if(sarge != null) sarge.DrawGUI(evt);
		}
	}
}