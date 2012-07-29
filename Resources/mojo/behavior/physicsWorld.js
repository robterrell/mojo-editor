/**
 * @fileoverview behavior.Base is the base class for all behaviors
 * @author Rob Terrell
 */

goog.provide('mojo.behavior.physicsWorld');

var world;

mojo.behavior.physicsWorld = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Physics World";
	this.description = "Physics World";
	this.gameObject = target;
	this.properties = { "gravity": 10, "frameRate":60, "velocityIterations":10, "positionIterations": 10, debug: 0};
}
goog.inherits(mojo.behavior.physicsWorld, mojo.behavior.base);


mojo.behavior.physicsWorld.prototype.onStart = function()
{
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
          ;
    
	world = new b2World( new b2Vec2(0, this.properties.gravity), true );
    world.ginorm_pixelsPerMeter = 30;    


	if (this.properties.debug) {
		var debugDraw = new b2DebugDraw();
		var newCanvas = document.createElement('canvas');
		var r = document.getElementsByTagName("rendercontext")[0];
		var topValue= 0,leftValue= 0;
		var obj = r;
		while(obj){
			leftValue+= obj.offsetLeft;
			topValue+= obj.offsetTop;
			obj= obj.offsetParent;
		}
		newCanvas.height="900";
		newCanvas.width="900";
		newCanvas.style.position = "absolute";
		newCanvas.style.left = leftValue + "px";
		newCanvas.style.top = topValue + "px";
		document.body.appendChild(newCanvas);	
		
		var context = newCanvas.getContext('2d');
		 
		debugDraw.SetSprite(context);
		debugDraw.SetDrawScale(30.0);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);
		this.debugCanvas = newCanvas;
	}
	
};


mojo.behavior.physicsWorld.prototype.onUpdate = function()
{
	/*
	world.Step(
		 1 / this.properties.frameRate   //frame-rate
	  ,  this.properties.velocityIterations       //velocity iterations
	  ,  this.properties.positionIterations       //position iterations
	);*/
	world.Step(1/30, 10, 10);
	if (this.properties.debug) world.DrawDebugData();
	world.ClearForces();

};

mojo.behavior.physicsWorld.prototype.onStop = function()
{
	if (this.properties.debug) document.body.removeChild(this.debugCanvas);	
}

/*
goog.exportSymbol('mojo.behavior.physicsWorld.prototype.onEnterScene', mojo.behavior.physicsWorld.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.physicsWorld.prototype.onExitScene', mojo.behavior.physicsWorld.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.physicsWorld.prototype.onCollision', mojo.behavior.physicsWorld.prototype.onCollision);
goog.exportSymbol('mojo.behavior.physicsWorld.prototype.checkCollisions_', mojo.behavior.physicsWorld.prototype.checkCollisions_);

*/