var drip : GameObject;
var hit : RaycastHit;

function Awake () 
{
        var x = -1;
        var drops = Random.Range (1, 3);

        while (x <= drops)
        {
            x ++;
            
            var fwd = transform.TransformDirection (Random.onUnitSphere * 5);
                        if (Physics.Raycast (transform.position, fwd, hit, 10)) 
            {                splatter = Instantiate (drip, hit.point + (hit.normal * 0.1), Quaternion.FromToRotation (Vector3.up, hit.normal));
                            }        
        }
}