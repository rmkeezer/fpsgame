#pragma strict

var explosionRadius = 5.0;
var explosionPower = 10.0;
var explosionDamage = 100.0;

var explosionTime = 1.0;

function Start () {
	var explosionPosition = transform.position;
	var colliders : Collider[] = Physics.OverlapSphere (explosionPosition, 
		explosionRadius);
	
	for (var hit in colliders) {
		hit.rigidbody.AddExplosionForce(explosionPower, 
		explosionPosition, explosionRadius, 3.0);
		
		var closestPoint = hit.rigidbody.ClosestPointOnBounds(explosionPosition);
		var distance = Vector3.Distance(closestPoint, explosionPosition);
		
		var hitPoints = 1.0 - Mathf.Clamp01(distance / explosionRadius);
		hitPoints *= explosionDamage;
	   
		hit.rigidbody.SendMessageUpwards("ApplyDamage", hitPoints, 
			SendMessageOptions.DontRequireReceiver);
	}
	
	if(particleEmitter)
	{
		particleEmitter.emit = true;
		yield WaitForSeconds(0.5);
		particleEmitter.emit = false;
	}
	
	Destroy(gameObject, explosionTime);

}