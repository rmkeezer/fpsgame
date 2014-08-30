#pragma strict

var pushAmt : Vector3 = Vector3.zero;
private var thisController : CharacterController;
private var otherController : CharacterController;
private var speed : float = 0;
private var thisCollider : Collider;
private var isAI : boolean = false;
private var angle : float;

function Start()
{
	thisController = GetComponent(CharacterController);
	if(GetComponent(AI))
		isAI = true;
}

function OnTriggerStay(cc : Collider)
{
	if(cc.tag == "Collidable" && cc.transform.parent.gameObject != gameObject)
	{
		if(cc.transform.parent.GetComponent(AI)) {
			speed = cc.transform.parent.GetComponent(AI).speed;
			//angle = Vector3.Angle(cc.transform.forward,(cc.transform.position - transform.position).normalized);
			if(thisController) {
				//pushAmt += cc.transform.forward * (angle * speed * Time.deltaTime / 180);
				pushAmt += (transform.position - cc.transform.position).normalized * (speed * Time.deltaTime);
			}
		} else if(cc.transform.parent.GetComponent(FPSPlayer)) {
			speed = cc.transform.parent.GetComponent(FPSPlayer).speed;
			//angle = Vector3.Angle(cc.transform.forward,(cc.transform.position - transform.position).normalized);
			if(thisController) {
				//pushAmt += cc.transform.forward * (angle * speed * Time.deltaTime / 180);
				pushAmt += (transform.position - cc.transform.parent.position).normalized * (speed * Time.deltaTime);
			}
		} else if(cc.transform.parent && cc.transform.parent.parent && cc.transform.parent.parent.GetComponent(CarControlScript)) {
			speed = cc.transform.parent.parent.GetComponent(CarControlScript).currentSpeed+10;
			pushAmt += cc.transform.forward * speed * Time.deltaTime;
		} /*else {
			if(isAI) {
				speed = transform.GetComponent(AI).speed;
				pushAmt += cc.transform.forward * speed * Time.deltaTime;
			}
		}*/
	}
}

function FixedUpdate()
{
	if(pushAmt != Vector3.zero && thisController) {
		thisController.SimpleMove(pushAmt);
		pushAmt *= 0.95;
	}
}