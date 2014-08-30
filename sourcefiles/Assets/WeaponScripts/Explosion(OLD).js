#pragma strict

var explosionTime = 1.0;
var explosionRadius = 5.0;
var explosionPower = 2000.0;

function Start () {
	Destroy(gameObject, explosionTime);
	
	var colliders : Collider[] = Physics.OverlapSphere(
		transform.position, explosionRadius);
	
	for(var hit in colliders)
	{
		if(hit.rigidbody)
		{
			hit.rigidbody.AddExplosionForce(explosionPower,
				transform.position, explosionRadius);
		}
	}
	
	if(particleEmitter)
	{
		particleEmitter.emit = true;
		yield WaitForSeconds(0.5);
		particleEmitter.emit = false;
	}
}