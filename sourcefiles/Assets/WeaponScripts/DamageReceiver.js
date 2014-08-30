#pragma strict

var hitPoints = 100.0;
var detonationDelay = 0.0;
var explosion : Transform;
var deadReplacement : Rigidbody;

function ApplyDamage(damage : float)
{
	if(hitPoints <= 0.0)
		return;
	
	hitPoints -= damage;
	if(hitPoints <= 0.0)
	{
		var emitter : ParticleEmitter = GetComponentInChildren(ParticleEmitter);
		if(emitter)
			emitter.emit = true;
			
		Invoke("DelayedDetonate", detonationDelay);
	}
}

function DelayedDetonate()
{
	BroadcastMessage("Detonate");
}

function Detonate()
{
	Destroy(gameObject);
	
	if(explosion)
		Instantiate(explosion, transform.position, transform.rotation);
		
	if(deadReplacement)
	{
		var dead : Rigidbody = Instantiate(deadReplacement, transform.position,
			transform.rotation);
		
		dead.rigidbody.velocity = rigidbody.velocity;
		dead.angularVelocity = rigidbody.angularVelocity;
	}
	
	var emitter : ParticleEmitter = GetComponentInChildren(ParticleEmitter);
	if(emitter)
	{
		emitter.emit = false;
		emitter.transform.parent = null;
	}
}

@script RequireComponent(Rigidbody)