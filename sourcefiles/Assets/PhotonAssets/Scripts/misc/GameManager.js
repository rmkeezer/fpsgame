#pragma strict
#pragma implicit
#pragma downcast

class GameManager extends MonoBehaviour
{
	public var gamePlaySoldier : GameObject;
    public var soldierSmoke : ParticleEmitter;
    public var sarge : SargeManager;
    public var _photon : GameObject;
	static public var receiveDamage : boolean;
	static public var showMenu : boolean;
	static public var scores : boolean;
	static public var chat : boolean;
	static public var inventory : boolean;
	static public var time : float;
	static public var running;
	public var InitGame : boolean = false;
	public var menu : MainMenuScreen;
	public var mainCamera : GameObject;
	private var savedTimeScale : float = 1.0;

    public var PauseEffectCameras : Camera[];
	
	private var menuShown : boolean;
	
	private var inLobby : boolean; 
	
	public var isLocal : boolean = false;
	
	private var pauseMenu : boolean = false;
	
	public static var isPaused : boolean = false;
	
	function Start()
	{
		TrainingStatistics.ResetStatistics();
		
		//Screen.lockCursor = true;
		
		running = false;
		showMenu = false;
		menuShown = false;
		scores = false;
		inventory = false;
		time = 0.0;

        var auxT : Transform;
        var hasCutscene : boolean = false;
        for(var i : int = 0; i < transform.childCount; i++)
        {
            auxT = transform.GetChild(i);

            if(auxT.name == "Cutscene")
            {
            	var auxTactive: boolean;
            	#if UNITY_3_5
                if(auxT.gameObject.active)
                {
                    hasCutscene = true;
                    break;
                }
				#endif
				#if UNITY_4
				if(auxT.gameObject.activeSelf)
                {
                    hasCutscene = true;
                    break;
                }
				#endif
            }
        }

        if(!hasCutscene)
        {
            StartGame();
        }
	}
	
	function CutsceneStart()
	{
		#if UNITY_3_5
			gamePlaySoldier.SetActiveRecursively(false);
		#endif
		#if UNITY_4
			gamePlaySoldier.SetActive(false);
		#endif
	}
	
	function initGame()
	{
		InitGame = true;
		showMenu = false;// never show menu or pause when game is created
		
		menu.visible = showMenu;
		//_photon.SendMessage("StatusPause",showMenu);
		if(showMenu)
		{
		//                Time.timeScale = 0.00001;
		}
		else
		{
		    Time.timeScale = 1.0;
		}
		
		menuShown = showMenu;
		//            CameraBlur(showMenu);
		
		
		/*for(var i : int = 0; i < PauseEffectCameras.Length; i++)
		{
			var cam : Camera = PauseEffectCameras[i];
		    if (cam != null)
		    {
		        if (cam.name == "Soldier Camera")
		        {
			        var scriptSoldierCamera : MonoBehaviour = cam.transform.GetComponent("SoldierCamera");
			        scriptSoldierCamera.enabled = !showMenu;
		    	}
			}
			if (cam == null) continue;
			if (cam.name != "radar_camera") continue;
			
			cam.enabled = !showMenu;
		}*/
	}
	
	function SetInLobby(il : boolean)
	{
		inLobby = il;
	}
	
	function SetMenuVisible(ms : boolean)
	{
		menu.visible = ms;
		//menuShown = ms;
	}
	
	function SetChat(_flag : boolean)
	{
	    chat = _flag;
	   //chatting = _flag;
	   if(chat) {
			Screen.showCursor = true;
			GameObject.Find("MainCameraController").GetComponent(MouseLook).enabled = false;
			GameObject.FindWithTag("Player").GetComponent(MouseLook).enabled = false;
			TogglePause();
			GameObject.Find("Code_game").SendMessage("ShowChat", true);
		} else {
			Screen.showCursor = false;
			AudioListener.pause = false;
			GameObject.Find("MainCameraController").GetComponent(MouseLook).enabled = true;
			GameObject.FindWithTag("Player").GetComponent(MouseLook).enabled = true;
			TogglePause();
			GameObject.Find("Code_game").SendMessage("ShowChat", false);
		}
	}
	
	function SetScores(_flag : boolean)
	{
	   scores = _flag;
	   if(scores) {
			GameObject.Find("ScoreBoard(Clone)").SendMessage("ShowBoard", true);
		} else {
			GameObject.Find("ScoreBoard(Clone)").SendMessage("ShowBoard", false);
		}
	}
	
	function EscapePressed()
	{
		if (chat && !isLocal)
		{
			//_photon.SendMessage("StatusPauseChat",false);
			chat = false;
			Screen.showCursor = false;
			AudioListener.pause = false;
			GameObject.Find("MainCameraController").GetComponent(MouseLook).enabled = true;
			GameObject.FindWithTag("Player").GetComponent(MouseLook).enabled = true;
		} 
		else if(inventory)
		{
			TogglePause();
			OpenInventory();
		}
		else 
		{
			TogglePause();
			showMenu = !showMenu;
			menu.visible = showMenu;			
		    //_photon.SendMessage("StatusPause",showMenu);
		}
	}
	
	/*public function DisableCameras(v : boolean)
	{
		for(var i : int = 0; i < PauseEffectCameras.Length; i++)
		{
			var cam : Camera = PauseEffectCameras[i];
			
			if (cam != null)
			{
				if (cam.name == "Soldier Camera")
				{
					var scriptSoldierCamera : MonoBehaviour = cam.transform.GetComponent("SoldierCamera");
					scriptSoldierCamera.enabled = !v;
				}
			}
			
			if (cam == null) continue;
			if (cam.name != "radar_camera") continue;
			
			cam.enabled = !v;
		}
	}*/
	
    function Update()
	{
		if(!showMenu && running) time += Time.deltaTime;
		
		if (Input.GetKeyDown(KeyCode.Escape)) 
        {
            EscapePressed();
        }
        
     	if (Input.GetKeyUp (KeyCode.I) && !chat) 
     	{
     		TogglePause();
     		OpenInventory();
     	}

		if(menuShown != showMenu)
        {
             menuShown = showMenu;
             //CameraBlur(showMenu);            
 
        	for(var i : int = 0; i < PauseEffectCameras.Length; i++)
        	{
        		var cam : Camera = PauseEffectCameras[i];
        		
        		if (cam != null)
                {
                    if (cam.name == "Soldier Camera")
                    {
            	        var scriptSoldierCamera : MonoBehaviour = cam.transform.GetComponent("SoldierCamera");
            	        scriptSoldierCamera.enabled = !showMenu;
        	    	}
        		}
        		
            	if (cam == null) continue;
            	if (cam.name != "radar_camera") continue;
            	
            	cam.enabled = !showMenu;
        	}
        }
        
        if(Input.GetKeyUp(KeyCode.Return))
        {
        	SetChat(!chat);
        }
        
        if(Input.GetKeyUp(KeyCode.Tab))
        {
        	SetScores(!scores);
        }
		
		//Screen.showCursor = !(!chat && !showMenu && !scores && !inventory && !pauseMenu);
	}	
	
	function StartGame()
	{
		running = true;

        if(gamePlaySoldier != null)
        {
        	#if UNITY_3_5
	            if(!gamePlaySoldier.active)
	            {
			        gamePlaySoldier.SetActiveRecursively(true);
	            }
            #endif
            #if UNITY_4
	            if(!gamePlaySoldier.activeSelf)
	            {
			        gamePlaySoldier.SetActive(true);
	            }
            #endif
        }

        if(soldierSmoke != null)
        {
            if(GameQualitySettings.ambientParticles)
            {
                soldierSmoke.emit = true;
            }
        }

        if(sarge != null && Application.loadedLevelName == "demo_forest")
        {
            sarge.ShowInstruction("instructions");
		    sarge.ShowInstruction("instructions2");
		    sarge.ShowInstruction("instructions3");
		    sarge.ShowInstruction("instructions4");
		    sarge.ShowInstruction("instructions5");
		    sarge.ShowInstruction("additional_instructions");
        }
        
        showMenu = !showMenu;		
			
		menu.visible = showMenu;
		//_photon.SendMessage("StatusPause",showMenu);
			
            if(showMenu)
            {
//                Time.timeScale = 0.00001;
            }
            else
            {
                Time.timeScale = 1.0;
            }
		

        if(menuShown != showMenu)
        {
			menuShown = showMenu;
//            CameraBlur(showMenu);            
 
        	for(var i : int = 0; i < PauseEffectCameras.Length; i++)
        	{
        		var cam : Camera = PauseEffectCameras[i];
                if (cam != null)
                {
                    if (cam.name == "Soldier Camera")
                    {
            	        var scriptSoldierCamera : MonoBehaviour = cam.transform.GetComponent("SoldierCamera");
            	        scriptSoldierCamera.enabled = !showMenu;
        	    	}
        		}
            	if (cam == null) continue;
            	if (cam.name != "radar_camera") continue;
            	
            	cam.enabled = !showMenu;
        	}           
        }
	}

    /*function CameraBlur(state : boolean)
    {
        if(PauseEffectCameras == null) return;
        if(PauseEffectCameras.Length <= 0) return;

        var blurEffect : BlurEffect;

        for(var i : int = 0; i < PauseEffectCameras.Length; i++)
        {
        	var cam : Camera = PauseEffectCameras[i];
            if (cam == null) continue;

            blurEffect = cam.GetComponent("BlurEffect") as BlurEffect;
            
            if (blurEffect == null)
            {
                blurEffect = cam.gameObject.AddComponent("BlurEffect") as BlurEffect;
                blurEffect.iterations = cam.gameObject.name.IndexOf("radar") != -1 ? 1 : 2;
                blurEffect.blurSpread = 0.4;
            }    

            blurEffect.enabled = state;
        }
    }*/
    
    function ToggleRunning(run : boolean)
    {
    	running = run;
    }
    
    function OpenInventory()
    {
    	inventory = !inventory;
		GameObject.Find("InventoryManager").GetComponent(Inventory).OpenInventoryButton();
    }
    
    function TogglePause()
    {
		if(!isPaused) {
			isPaused = true;
			pauseMenu = true;
			savedTimeScale = Time.timeScale;
			if(PlayerPrefs.GetInt("IsMultiplayer") == 0)
				Time.timeScale = 0;
			if(GameObject.FindWithTag("Player")) {
				Screen.showCursor = true;
				GameObject.Find("MainCameraController").GetComponent(MouseLook).enabled = false;
				GameObject.FindWithTag("Player").GetComponent(MouseLook).enabled = false;
			}
		} else {
			isPaused = false;
			pauseMenu = false;
			Time.timeScale = savedTimeScale;
			AudioListener.pause = false;
			if(GameObject.FindWithTag("Player")) {
				Screen.showCursor = false;
				GameObject.Find("MainCameraController").GetComponent(MouseLook).enabled = true;
				GameObject.FindWithTag("Player").GetComponent(MouseLook).enabled = true;
			}
		}
    }
    
    function SetIsLocal(local : boolean)
    {
    	isLocal = local;
    }
}
