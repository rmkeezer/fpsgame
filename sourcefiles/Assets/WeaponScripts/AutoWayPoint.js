import System.Collections.Generic;

static var waypoints : List.<Object> = new List.<Object>();
var waypointIndex : int;
var connected : List.<AutoWayPoint> = new List.<AutoWayPoint>();
static var kLineOfSightCapsuleRadius = 0.25;
var numOfUnits = 0;
var maxNumOfUnits = 10;
var objectiveCode = 0;
var teamCode = 0;
@HideInInspector
var unitList : List.<GameObject> = new List.<GameObject>();
var isBase : boolean = false;

static function FindClosest (pos : Vector3) : AutoWayPoint {
	// The closer two vectors, the larger the dot product will be.
	var closest : AutoWayPoint;
	var closestDistance = 100000.0;
	for (var cur : AutoWayPoint in waypoints) {
		if(cur.objectiveCode != 0)
			continue;
		var distance = Vector3.Distance(cur.transform.position, pos);
		if (distance < closestDistance)
		{
			closestDistance = distance;
			closest = cur;
		}
	}
	
	return closest;
}

@ContextMenu ("Update Waypoints")
function UpdateWaypoints () {
	RebuildWaypointList();
}

function Awake () {
	RebuildWaypointList();
	for(var i=0; i<waypoints.Count; i++)
	{
		if(waypoints[i].Equals(this))
			waypointIndex = i;
	}
}


// Draw the waypoint pickable gizmo
function OnDrawGizmos () {
	Gizmos.DrawIcon (transform.position, "Waypoint.tif");
}

// Draw the waypoint lines only when you select one of the waypoints
function OnDrawGizmosSelected () {
	if (waypoints.Count == 0)
		RebuildWaypointList();
	for (var p : AutoWayPoint in connected) {
		if (Physics.Linecast(transform.position, p.transform.position)) {
			Gizmos.color = Color.red;
			Gizmos.DrawLine (transform.position, p.transform.position);
		} else {
			Gizmos.color = Color.green;
			Gizmos.DrawLine (transform.position, p.transform.position);
		}
	}
}

function RebuildWaypointList () {
	var objects : Object[] = FindObjectsOfType(AutoWayPoint);
	waypoints = new List.<Object>(objects);
	
	for (var point : AutoWayPoint in waypoints) {
		point.RecalculateConnectedWaypoints();
	}
}

function RecalculateConnectedWaypoints ()
{
	connected = new List.<AutoWayPoint>();
	
	var point1 : AutoWayPoint;
	var point2 : AutoWayPoint;
	var point3 : AutoWayPoint;

	for (var other : AutoWayPoint in waypoints) {
		// Don't connect to ourselves
		if (other == this)
			continue;
			
		// Don't connect to other objectives or teams
		if(objectiveCode != other.objectiveCode || teamCode != other.teamCode)
			continue;
		else if(objectiveCode != 0)
			connected.Add(other);
		
		// find closest 3 waypoints
		if(!point1) {
			point1 = other;
			continue;
		} else if(!point2) {
			point2 = other;
			continue;
		} else if(!point3) {
			point3 = other;
			continue;
		}
		if(Vector3.Distance(other.transform.position, transform.position) < Vector3.Distance(point3.transform.position, transform.position))
			point3 = other;
		else if(Vector3.Distance(other.transform.position, transform.position) < Vector3.Distance(point2.transform.position, transform.position))
			point2 = other;
		else if(Vector3.Distance(other.transform.position, transform.position) < Vector3.Distance(point1.transform.position, transform.position))
			point1 = other;
		
		// Do we have a clear line of sight?
		//if (!Physics.CheckCapsule(transform.position, other.transform.position, kLineOfSightCapsuleRadius)) {
		//}
	}
	if(point1)
		connected.Add(point1);
	if(point2)
		connected.Add(point2);
	if(point3)
		connected.Add(point3);
	
}

function findIndex(obj : GameObject) : int
{
	for (var i = 0; i < unitList.Count; i++) {
        if (unitList[i] == obj) {
            return i;
        }
    }
    return -1;
}