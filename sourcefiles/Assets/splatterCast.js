var splat : GameObject;

function Update () 
{
    if (Input.GetMouseButtonDown(0))
    {
        var ray = camera.ScreenPointToRay (Input.mousePosition);
        var hit : RaycastHit;

        if (Physics.Raycast (transform.position, transform.forward, hit, Mathf.Infinity)) 
        {
            theSplat = Instantiate (splat, hit.point + (hit.normal * 0.1), Quaternion.identity);
        }
    }
}