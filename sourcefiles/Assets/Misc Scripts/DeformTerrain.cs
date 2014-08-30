using UnityEngine;
using System.Collections;

public class DeformTerrain : MonoBehaviour {
	
	public float amount;
	
	// Use this for initialization
	void Start () {
		if(transform.position.x < 256 - amount && transform.position.z < 256 - amount)
			GameObject.Find("Terrain").GetComponent<TerrainDeformer>().DestroyTerrain(transform.position,amount);
	}
}
