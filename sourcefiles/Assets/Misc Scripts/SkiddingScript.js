#pragma strict

var currentFrictionValue : float;
var skidAt : float = 1.5;
var soundEmission : float = 15;
private var soundWait : float = 0;
var skidSound : GameObject;
var markWidth : float = 0.2;
private var skidding : boolean = false;
private var lastPos = new Vector3[2];
var skidMaterial : Material;
private var isNear : boolean = false;

function Start () {
	CheckIfNear();
}

function Update () {
	if(isNear)
	{
		var hit : WheelHit;
		transform.GetComponent(WheelCollider).GetGroundHit(hit);
		currentFrictionValue = Mathf.Abs(hit.sidewaysSlip);
		if(skidAt <= currentFrictionValue && soundWait <= 0) {
			Instantiate(skidSound,hit.point,Quaternion.identity);
			soundWait = 1;
		}
		soundWait -= Time.deltaTime*soundEmission;
		if(skidAt <= currentFrictionValue) {
			SkidMesh(hit);
		} else {
			skidding = false;
		}
	}
}

function SkidMesh(hit : WheelHit)
{
	var mark : GameObject = new GameObject("Mark");
	var filter : MeshFilter = mark.AddComponent(MeshFilter);
	mark.AddComponent(MeshRenderer);
	var markMesh : Mesh = new Mesh();
	var vertices = new Vector3[4];
	var triangles = new int[6];
	if(!skidding) {
		vertices[0] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(markWidth,0.01,0);
		vertices[1] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(-markWidth,0.01,0);
		vertices[2] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(-markWidth,0.01,0);
		vertices[3] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(markWidth,0.01,0);
		lastPos[0] = vertices[2];
		lastPos[1] = vertices[3];
		skidding = true;
	} else {
		vertices[1] = lastPos[0];
		vertices[0] = lastPos[1];
		vertices[2] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(-markWidth,0.01,0);
		vertices[3] = hit.point + Quaternion.Euler(transform.eulerAngles) * Vector3(markWidth,0.01,0);
		lastPos[0] = vertices[2];
		lastPos[1] = vertices[3];
	}
	triangles = [0,1,2,2,3,0];
	markMesh.vertices = vertices;
	markMesh.triangles = triangles;
	markMesh.RecalculateNormals();
	var uvm : Vector2[] = new Vector2[4];
	uvm[0] = Vector2(1,0);
	uvm[1] = Vector2(0,0);
	uvm[2] = Vector2(0,1);
	uvm[3] = Vector2(1,1);
	markMesh.uv = uvm;
	filter.mesh = markMesh;
	mark.renderer.material = skidMaterial;
	mark.AddComponent(DestroyTimer);
}

function CheckIfNear()
{
	while(true)
	{
		isNear = transform.parent.parent.GetComponent(CarControlScript).isNear;
		
		yield WaitForSeconds(1);
	}
}