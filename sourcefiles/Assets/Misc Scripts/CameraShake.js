#pragma strict

var originPosition : Vector3;
var originRotation : Quaternion;

var shake_decay : float;
var shake_intensity : float;
public var thePlayerObject : GameObject;


function Update()
{
    if(shake_intensity > 0.05F){
        /*transform.rotation =  Quaternion(
                        transform.rotation.x + shake_intensity,
                        transform.rotation.y,
                        transform.rotation.z,
                        transform.rotation.w);*/
        thePlayerObject.GetComponent(MouseLook).SetRotationX(Random.Range(-0.5F,0.5F));
        GetComponent(MouseLook).SetRotationY(shake_intensity);
        shake_intensity -= shake_intensity*10*Time.deltaTime;
    }
}

function Shake(recoilRate : float)
{
    shake_intensity += recoilRate/10F;
}