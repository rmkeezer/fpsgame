#pragma strict
var explosion : GameObject;
var timeOut = 3.0;
private var contact : ContactPoint;
private var hasContacted : boolean = false;

function Start () 
{
	Invoke("Kill", timeOut);
}

function OnCollisionEnter (collision : Collision) 
{
	contact = collision.contacts[0];
	hasContacted = true;
}

function Kill () 
{
	if(hasContacted) {
		var rotation = Quaternion.FromToRotation(Vector3.up, contact.normal);
    	Instantiate (explosion, contact.point, rotation);
    } else {
    	Instantiate (explosion, transform.position, transform.rotation);
    }

	Destroy(gameObject);
}