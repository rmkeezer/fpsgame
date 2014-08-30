var explosion : GameObject;
var timeOut = 3.0;

function Start () {
	Invoke("Kill", timeOut);
}


function OnCollisionEnter (collision : Collision) {
	var contact : ContactPoint = collision.contacts[0];
	var rotation = Quaternion.FromToRotation(Vector3.up, contact.normal);
    Instantiate (explosion, contact.point, rotation);

	Kill ();    
}

function Kill () {
	// Stop emitting particles in any children
	var emitter : ParticleEmitter= GetComponentInChildren(ParticleEmitter);
	if (emitter)
		emitter.emit = false;

	// Detach children - We do this to detach the trail rendererer which should be set up to auto destruct
	transform.DetachChildren();
	
	Destroy(gameObject);
}


@script RequireComponent (Rigidbody)