@script ExecuteInEditMode ()
var bulletTexture : Texture2D;
var posX : float;
var posY : float;

private var bulletWidth : int = 0;
private var bulletHeight : int = 0;
private var clipSize : int = 0;
private var bulletCount : int = 0;

function OnGUI()
{
		for(var i=0; i<bulletCount; i++)
			GUI.DrawTexture(Rect((posX*Screen.width) - (i*bulletWidth),Screen.height - posY,
							bulletWidth, bulletHeight), bulletTexture);

			
}

function UpdateRockets(bullets : int, clip : int, width : int, height : int)
{
	bulletCount = bullets;
	clipSize = clip;
	bulletWidth = width;
	bulletHeight = height;
}