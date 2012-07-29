/**
 * @fileoverview behavior.Base is the base class for all behaviors
 * @author Rob Terrell
 */

goog.provide('mojo.behavior.rigidbody');

mojo.behavior.rigidbody = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Rigid Body";
	this.description = "Rigid Body physics object";
	this.gameObject = target;
	this.properties = { "density": 1, "friction":.5, "restitution":0.2, "bodyType": "dynamic", "shape": "box", "mass": 1.0, centerOfMass: {"x":0,"y":0}, scale: {"x":1, "y":1} };
}
goog.inherits(mojo.behavior.rigidbody, mojo.behavior.base);

mojo.behavior.rigidbody.prototype.onEnterScene = function()
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
     	
	this.fixDef = new b2FixtureDef;
	this.fixDef.density = this.density | this.properties.density;
	this.fixDef.friction = this.friction | this.properties.friction;
	this.fixDef.restitution = this.restitution | this.properties.restitution;

//	if (this.mass) this.fixDef.density *= this.mass;

	this.bodyDef = new b2BodyDef;
	
 	if (this.properties.bodyType == "dynamic" || this.properties.bodyType == null) {
 		this.bodyDef.type = b2Body.b2_dynamicBody;
 	} else {
 		this.bodyDef.type = b2Body.b2_staticBody;
 	}
	
	this.bodyDef.position.x = this.gameObject.getPosition().x / world.mojo_pixelsPerMeter;
	this.bodyDef.position.y = this.gameObject.getPosition().y / world.mojo_pixelsPerMeter;
	this.bodyDef.angle = this.gameObject.getRotation() * -0.0174532925;
	
	if (this.properties.shape == "circle") {
		this.fixDef.shape = new b2CircleShape( this.gameObject.getSize().width / 2 / world.mojo_pixelsPerMeter);
	} else {
		this.fixDef.shape = new b2PolygonShape;
		this.fixDef.shape.SetAsBox((this.gameObject.getSize().width / world.mojo_pixelsPerMeter) / 2, (this.gameObject.getSize().height / world.mojo_pixelsPerMeter) / 2);
	}

	this.body = world.CreateBody(this.bodyDef);
	this.body.CreateFixture(this.fixDef);
	//this.body.SetMassData(new b2MassData(new b2Vec2(this.properties.centerOfMass.x, this.properties.centerOfMass.y), 0, this.properties.mass));
	console.log("created rigidbody for", this.gameObject.className);
	this.gameObject.body = this.body;
};


mojo.behavior.rigidbody.prototype.onUpdate = function( d ) {

	this.gameObject.setPosition(this.body.GetPosition().x * world.mojo_pixelsPerMeter, this.body.GetPosition().y * world.mojo_pixelsPerMeter);
	this.gameObject.setRotation(this.body.GetTransform().GetAngle()*-57.2957795);
};

mojo.behavior.rigidbody.prototype.getRigidBody = function() {
	return this.body;
}

/*
goog.exportSymbol('mojo.behavior.rigidbody.prototype.onEnterScene', mojo.behavior.rigidbody.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.rigidbody.prototype.onExitScene', mojo.behavior.rigidbody.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.rigidbody.prototype.onCollision', mojo.behavior.rigidbody.prototype.onCollision);
goog.exportSymbol('mojo.behavior.rigidbody.prototype.checkCollisions_', mojo.behavior.rigidbody.prototype.checkCollisions_);

*/