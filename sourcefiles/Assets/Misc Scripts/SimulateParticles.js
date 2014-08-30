#pragma strict

var simulate = 1.0;

function Start()
{
    var step = 0.03;
    for (var i=0.0; i<simulate; i+=step)
       particleEmitter.Simulate(step);
}