//set main namespace
goog.provide('mojo.behavior.slideWithTouch');

goog.require('mojo.behavior.base');
goog.require('lime.Sprite');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');


mojo.behavior.slideWithTouch = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Slide to touch";
	this.description = "Left-to-right slider, moves the sprite to the click or touch location";
	this.properties = {"rate": 1.0, "constrainToX": true, "ignoreZone": ""};
	this.gameObject = target;
	this.ignoreRect = goog.math.Box(0,0,0,0);
}

goog.inherits(mojo.behavior.slideWithTouch, mojo.behavior.base);

mojo.behavior.slideWithTouch.prototype.onStart = function()
{
	this.ignoreRect = goog.math.Box(0,0,0,0);
	console.log("slideWithTouch onStart");
	if (this.properties.ignoreZone == "top") {
		this.ignoreRect = this.stage.getBoundingBox().clone();
		this.ignoreRect.expand(0,0,(this.ignoreRect.bottom-this.ignoreRect.top)/2,0);
		console.log("ignoreRect: " + this.ignoreRect);
	}
}

/*mojo.behavior.slideWithTouch.prototype.onEnterScene = function()
{
	console.log("slideWithTouch onEnterScene");
};

mojo.behavior.slideWithTouch.prototype.onExitScene = function( e ){
	console.log("slideWithTouch onExitScene");
	if (this.action) this.action.stop();
};*/


/*
mojo.behavior.slideWithTouch.prototype.onMouseUp = function( e ){
	console.log("slideWithTouch onMouseUp");
};
*/

mojo.behavior.slideWithTouch.prototype.onMouseDown = function( e ){
	console.log("slideWithTouch onMouseDown");
	var pos = {};
	
//	if (this.ignoreRect.contains(e.position)) {
//		console.log("ignoring touch: " + e + " inside " + this.ignoreRect);
//		return;
//	}
	
	pos.x = e.position.x;
	pos.y = this.properties.constrainToX ? this.gameObject.getPosition().y : e.position.y;
	
	var dir = 1;
	if (pos.x > this.gameObject.getPosition().x) dir = -1;

	this.action = new lime.animation.MoveTo(pos).setDuration(this.properties.rate);
	
	this.gameObject.runAction( this.action );
	
};

mojo.behavior.slideWithTouch.prototype.onAnimationStop = function( e ){
	console.log("slideWithTouch onAnimationStop");
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.slideWithTouch.prototype.onEnterScene', mojo.behavior.slideWithTouch.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.slideWithTouch.prototype.onExitScene', mojo.behavior.slideWithTouch.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.slideWithTouch.prototype.onUpdate', mojo.behavior.slideWithTouch.prototype.onUpdate);
goog.exportSymbol('mojo.behavior.slideWithTouch.prototype.onMouseUp', mojo.behavior.slideWithTouch.prototype.onMouseUp);
goog.exportSymbol('mojo.behavior.slideWithTouch.prototype.onMouseDown', mojo.behavior.slideWithTouch.prototype.onMouseDown);
