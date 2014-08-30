using UnityEngine;
using System.Collections;

public enum CharacterState
{
    Idle = 0,
    Walking = 1,
    Running = 2,
    Jumping = 3,
	Idle_crouch = 4,
	Walking_crouch = 5,
}

public class AINetworkAnimation : MonoBehaviour
{
	
	public bool isControllable = false;
	public CharacterState _characterState;
	
	// my variables
	public GameObject animationObject;
	public float minimumWalkSpeed = 0.1f;
	public float minimumRunSpeed = 3.0f;
	public float speed = 0.0f;
	
	// crouch variables
	private bool crouch = false;
	private CharacterController ch;
	private float height;
	private float h;
	private float lastHeight;
	
	
	void Start () 
	{
		//SendMessage("SetOffSet", OffSetPosition, SendMessageOptions.DontRequireReceiver);
		
    	ch = GetComponent<CharacterController>();
		height = ch.height;
		
		// Set all animations to loop
		if(animationObject)
		{
			animationObject.animation.wrapMode = WrapMode.Loop;
		
			// Except our action animations, Dont loop those
			animationObject.animation["shoot"].wrapMode = WrapMode.Once;
			animationObject.animation["shoot_crouch"].wrapMode = WrapMode.Once;
			
			// Put idle and run in a lower layer. They will only animate if our action animations are not playing
			animationObject.animation["idle"].layer = -1;
			animationObject.animation["walk"].layer = -1;
			animationObject.animation["run"].layer = -1;
			animationObject.animation["idle_crouch"].layer = -1;
			animationObject.animation["walk_crouch"].layer = -1;
			
			animationObject.animation.Stop();
		}
	}
	
	
	public void SetSpeed (float speed) 
	{
		this.speed = speed;
		if(!crouch)
		{
			if(speed > minimumRunSpeed) {
    			//SendMessage("SetWalk", false, SendMessageOptions.DontRequireReceiver);
                _characterState = CharacterState.Running;
			} else if(speed > minimumWalkSpeed) {
    			//SendMessage("SetWalk", true, SendMessageOptions.DontRequireReceiver);
                _characterState = CharacterState.Walking;
			} else {
    			//SendMessage("SetIdle", true, SendMessageOptions.DontRequireReceiver);
				_characterState = CharacterState.Idle;
			}
		} else {
			if(speed > minimumRunSpeed) {
    			//SendMessage("SetCrouch", true, SendMessageOptions.DontRequireReceiver);
    			//SendMessage("SetWalk", false, SendMessageOptions.DontRequireReceiver);
                _characterState = CharacterState.Walking_crouch;
			} else if(speed > minimumWalkSpeed) {
    			//SendMessage("SetCrouch", true, SendMessageOptions.DontRequireReceiver);
    			//SendMessage("SetWalk", true, SendMessageOptions.DontRequireReceiver);
                _characterState = CharacterState.Walking_crouch;
			} else {
    			//SendMessage("SetCrouch", true, SendMessageOptions.DontRequireReceiver);
    			//SendMessage("SetIdle", true, SendMessageOptions.DontRequireReceiver);
				_characterState = CharacterState.Idle_crouch;
			}
		}
	}
	
	void Update()
	{
		h = height;
		if(_characterState == CharacterState.Idle) {
			animationObject.animation.CrossFade("idle");
			SetCrouch(false);
		} else if(_characterState == CharacterState.Running) {
			animationObject.animation.CrossFade("run");
			SetCrouch(false);
		} else if(_characterState == CharacterState.Walking) {
			animationObject.animation.CrossFade("walk");
			SetCrouch(false);
		} else if(_characterState == CharacterState.Idle_crouch) {
			animationObject.animation.CrossFade("idle_crouch");
			SetCrouch(true);
		} else if(_characterState == CharacterState.Walking_crouch) {
			animationObject.animation.CrossFade("walk_crouch");
			SetCrouch(true);
		}
	}
	
	public void SetCrouch(bool theCrouch)
	{
		if(crouch != theCrouch) {
			SendMessage("SetCrouching", theCrouch);
			crouch = theCrouch;
		}
	}
	
	public bool GetIsControllable()
	{
		return isControllable;
	}
	
	public void EnableAnim(bool enable)
	{
		GetComponent<AINetworkAnimation>().enabled = enable;
	}

}