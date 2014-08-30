#pragma strict

var pushAmt : Vector3;
private var thisController : CharacterController;
private var otherController : CharacterController;

function Start()
{
	thisController = GetComponent(CharacterController);
}

function OnTriggerStay(cc : Collider)
{
	if(cc != transform.collider && cc.gameObject.GetComponent(CharacterController))
	{
		otherController = cc.gameObject.GetComponent(CharacterController);
		pushAmt += thisController.velocity.normalized * thisController.velocity.magnitude;
	}
}

function FixedUpdate()
{
	if(pushAmt != Vector3.zero) {
		otherController.SimpleMove(pushAmt);
		pushAmt *= 0.1;
	}
}