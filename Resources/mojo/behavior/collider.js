/**
 * @fileoverview behavior.Base is the base class for all behaviors
 * @author Rob Terrell
 */

goog.provide('mojo.behavior.collider');


mojo.behavior.collider = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Collider";
	this.description = "Detects collisions with other sprites";
	this.gameObject = target;
	this.properties = { "insetX": 0, "insetY":0 };
	this.hitSomethingLastTime_ = false;
}
goog.inherits(mojo.behavior.collider, mojo.behavior.base);


mojo.behavior.collider.prototype.onEnterScene = function()
{
	lime.scheduleManager.schedule(this.checkCollisions_, this);
};

mojo.behavior.collider.prototype.onExitScene = function()
{
	lime.scheduleManager.unschedule(this.checkCollisions_, this);
};

mojo.behavior.collider.prototype.onCollision = function( e ) {
	console.log("onCollision, hit: " + e.name);
};

mojo.behavior.collider.prototype.onCollisionExit = function() {
	console.log("onCollisionExit");
};


mojo.behavior.collider.prototype.checkCollisions_ = function( d ) {
	var f = this.gameObject.getBoundingBox(); //.expand(this.properties.insetX, this.properties.insetY/2, 0, this.properties.insetY/2);
	var g = this.gameObject.guid;
	var target = this;
	var hitSomething = false;
	renderContext.scene.children_.forEach( function(e,i) {
		if (e.guid == undefined) return;
		if (e.guid == g) return;
		var f2 = e.getBoundingBox();
		if (goog.math.Box.intersects(f, f2)) { target.onCollision(e); hitSomething = true;}
	});
	// TODO: this assumes one collision at a time. If multiple, onCollisionExit() is only called when ALL collisions exit.
	if (hitSomething == false && this.hitSomethingLastTime_) {
		target.onCollisionExit();
	}
	this.hitSomethingLastTime_ = hitSomething;
};

goog.exportSymbol('mojo.behavior.collider.prototype.onEnterScene', mojo.behavior.collider.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.collider.prototype.onExitScene', mojo.behavior.collider.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.collider.prototype.onCollision', mojo.behavior.collider.prototype.onCollision);
goog.exportSymbol('mojo.behavior.collider.prototype.checkCollisions_', mojo.behavior.collider.prototype.checkCollisions_);


