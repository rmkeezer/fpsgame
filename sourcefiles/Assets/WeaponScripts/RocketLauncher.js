#pragma strict

var projectile : Rigidbody;
var initialSpeed = 20.0;
var reloadTime = 0.5;
var ammoCount = 20;
var reloading : boolean = false;
private var lastShot = -10.0;

function Fire()
{
	if(Time.time > reloadTime + lastShot && ammoCount > 0)
	{
		reloading = false;
		var instantiatedProjectile : Rigidbody = Instantiate (projectile,
			transform.position, transform.rotation);
			
		instantiatedProjectile.velocity = transform.TransformDirection(
			Vector3(0,0,initialSpeed));
		
		Physics.IgnoreCollision(instantiatedProjectile.collider, transform.root.collider);
		
		lastShot = Time.time;
		ammoCount--;
	}
}