Shader "Transparent/Mask"
{
	Properties 
	{
		_MainTex ("Alpha (A) only", 2D) = "white" {}
		_GreyPower ("Grey color power", Range(0,2)) = 1
	}
	SubShader
	{
		Tags {"Queue" = "Geometry+10"}
        GrabPass { }
		Pass
		{
			Fog { Mode Off }
			Blend SrcAlpha OneMinusSrcAlpha

			CGPROGRAM

			#pragma vertex vert
			#pragma fragment frag
	
			sampler2D _GrabTexture;
			sampler2D _MainTex;
			float _GreyPower;

			struct appdata
			{
				float4 vertex : POSITION;
				float4 texcoord : TEXCOORD0;
			};

			struct v2f
			{
				float4 pos : SV_POSITION;
				float4 uv : TEXCOORD0;
			};

			v2f vert (appdata v)
			{
				v2f o;
				o.pos = mul(UNITY_MATRIX_MVP, v.vertex);
				o.uv = float4(v.texcoord.xy, 0, 0);
				return o;
			}

			half4 frag( v2f i ) : COLOR
			{
				half4 c = tex2D(_GrabTexture, float2(i.uv.x, 1 - i.uv.y));
				c.rgb = (c.r + c.g + c.b) * 0.33;
				c.a = saturate(tex2D(_MainTex, i.uv.xy).a + _GreyPower - 1);
				return c;
			}
			ENDCG
		}
	}
}