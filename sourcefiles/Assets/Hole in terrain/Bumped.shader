Shader "BumpedCave" {
	Properties {
		_Color ("Main Color", Color) = (1,1,1,1)
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_BumpMap ("Bump (RGB) Illumin (A)", 2D) = "bump" {}
	}
	SubShader {
		Tags{"Queue" = "Geometry+100"}
		UsePass "Self-Illumin/VertexLit/BASE"
		UsePass "Bumped Diffuse/PPL"
	} 
	FallBack "Diffuse", 1
}
