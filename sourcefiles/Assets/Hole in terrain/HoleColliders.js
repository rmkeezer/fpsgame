var colliders : Array = new Array();
var terrain : Collider;
var edge : Collider;

function OnTriggerEnter (other : Collider)
{
	Physics.IgnoreCollision(other, edge, false);
	Physics.IgnoreCollision(other, terrain, true);
	colliders.Add(other);
}

function OnTriggerExit (other : Collider)
{
	Physics.IgnoreCollision(other, edge, true);
	Physics.IgnoreCollision(other, terrain, false);
	var i = 0;
	var remove = -1;
	for(var c : Collider in colliders)
	{
		if(c == other)
		{
			remove = i;	
		}	
		i++;
	}
	if(remove != -1) colliders.RemoveAt(remove);
}

function Redo ()
{
	for(var other : Collider in colliders)
	{
		Physics.IgnoreCollision(other, edge, false);
		Physics.IgnoreCollision(other, terrain, true);	
	}	
}