using UnityEngine;
using System.Collections;

public class InstantXffect : MonoBehaviour {

	public string xffectName;
    private XffectComponent theEffect;

	// Use this for initialization
	void Start () 
	{
		theEffect = GameObject.Find("EffectCache").GetComponent<XffectCache>().GetEffect(xffectName);
		theEffect.Active();
		theEffect.transform.position = transform.position;
	}
}
