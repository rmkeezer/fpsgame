#pragma strict

function Start () {

}

var dayLight: Light;
var rotationAxis: Transform;
var dayLength = 1200.0;
private var dayTime = dayLength * 60;

function Update () {
	rotationAxis.Rotate(Vector3.right * Time.deltaTime / dayLength);
}
