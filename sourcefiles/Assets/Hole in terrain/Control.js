var speed = 0.00;
var force = 0.00;

function FixedUpdate ()
{
	var oldAngle = Camera.main.transform.localEulerAngles.x;
	Camera.main.transform.localEulerAngles.x = 0;
	var spin = Camera.main.transform.TransformDirection(Vector3(Input.GetAxis("Vertical") * speed, 0, -Input.GetAxis("Horizontal") * speed));
	Camera.main.transform.localEulerAngles.x = oldAngle;
	rigidbody.AddTorque((spin - rigidbody.angularVelocity) * force);
}