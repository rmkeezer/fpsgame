//	OnTouchDown.js
//	Allows "OnMouseDown()" events to work on the iPhone.
//	Attack to the main camera.

//function Update () {
//	// Code for OnMouseDown in the iPhone. Unquote to test.
//	var hit : RaycastHit;
//	for (var i = 0; i < iPhoneInput.touchCount; ++i) {
//		if (iPhoneInput.GetTouch(i).phase == iPhoneTouchPhase.Began) {
//		// Construct a ray from the current touch coordinates
//		var ray = camera.ScreenPointToRay (iPhoneInput.GetTouch(i).position);
//		if (Physics.Raycast (ray,hit)) {
//			hit.transform.gameObject.SendMessage("OnMouseDown");
//	      }
//	   }
//   }
//}

//	From the Unify Wiki
//	http://www.unifycommunity.com/wiki/index.php?title=OnMouseDown