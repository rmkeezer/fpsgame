 #pragma strict

var targetRotation : Quaternion;
var oldRotation : Quaternion;

function Start()
{
	targetRotation = Quaternion.identity;
	oldRotation = Quaternion.identity;
}

function LateUpdate () {
	if(targetRotation != Quaternion.identity && oldRotation != Quaternion.identity)
	{
		transform.parent.rotation = Quaternion.Slerp(oldRotation, targetRotation, Time.deltaTime * 5);
		oldRotation = transform.parent.rotation;
	} else if(targetRotation != Quaternion.identity && oldRotation == Quaternion.identity) {
		transform.parent.rotation = Quaternion.Slerp(transform.parent.rotation, targetRotation, Time.deltaTime * 5);
		oldRotation = transform.parent.rotation;
	}
}

function UpdateRotation(rotation : Quaternion)
{
	targetRotation = rotation;
}