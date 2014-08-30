/*var minimumWalkSpeed : float = 0.1;
var minimumRunSpeed : float = 5.0;
private var crouch : boolean = false;

function Start () 
{
	// Set all animations to loop
	animation.wrapMode = WrapMode.Loop;

	// Except our action animations, Dont loop those
	animation["shoot"].wrapMode = WrapMode.Once;
	animation["shoot_crouch"].wrapMode = WrapMode.Once;
	
	// Put idle and run in a lower layer. They will only animate if our action animations are not playing
	animation["idle"].layer = -1;
	animation["walk"].layer = -1;
	animation["run"].layer = -1;
	animation["idle_crouch"].layer = -1;
	animation["walk_crouch"].layer = -1;
	
	animation.Stop();
}

function SetSpeed (speed : float) 
{
	if(!crouch)
	{
		if(speed > minimumRunSpeed)
			animation.CrossFade("run");
		else if(speed > minimumWalkSpeed)
			animation.CrossFade("walk");
		else
			animation.CrossFade("idle");
	} else {
		if(speed > minimumRunSpeed)
			animation.CrossFade("walk_crouch");
		else if(speed > minimumWalkSpeed)
			animation.CrossFade("walk_crouch");
		else
			animation.CrossFade("idle_crouch");
	}
}

function SetCrouch(theCrouch : boolean)
{
	crouch = theCrouch;
}*/