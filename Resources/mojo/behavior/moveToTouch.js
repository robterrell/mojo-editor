//set main namespace
goog.provide('mojo.behavior.moveToTouch');

goog.require('mojo.behavior.base');
goog.require('lime.Sprite');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.RotateBy');


mojo.behavior.moveToTouch = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Move to location";
	this.description = "Moves the sprite to the click or touch location";
	this.properties = {"rate": 1.0, "constrainToX": true, "tiltOnMove": true, "ignoreZone": ""};
	this.gameObject = target;
	this.ignoreRect = goog.math.Box(0,0,0,0);
//	this.listener = {};
}

goog.inherits(mojo.behavior.moveToTouch, mojo.behavior.base);

mojo.behavior.moveToTouch.prototype.onStart = function()
{
	this.ignoreRect = goog.math.Box(0,0,0,0);
	console.log("moveToTouch onStart");
	if (this.properties.ignoreZone == "top") {
		this.ignoreRect = this.stage.getBoundingBox().clone();
		this.ignoreRect.expand(0,0,(this.ignoreRect.bottom-this.ignoreRect.top)/2,0);
		console.log("ignoreRect: " + this.ignoreRect);
	}
}

mojo.behavior.moveToTouch.prototype.onEnterScene = function()
{
	console.log("moveToTouch onEnterScene");
};

mojo.behavior.moveToTouch.prototype.onExitScene = function( e ){
	console.log("moveToTouch onExitScene");
	if (this.action) this.action.stop();
};

mojo.behavior.moveToTouch.prototype.onUpdate = function( e ){
	//console.log("moveToTouch onUpdate");
};

mojo.behavior.moveToTouch.prototype.onMouseUp = function( e ){
	//console.log("moveToTouch onMouseUp");
};

mojo.behavior.moveToTouch.prototype.onMouseDown = function( e ){
	//console.log("moveToTouch onMouseDown");
	var pos = {};
	
//	if (this.ignoreRect.contains(e.position)) {
//		console.log("ignoring touch: " + e + " inside " + this.ignoreRect);
//		return;
//	}
	
	pos.x = e.position.x;
	pos.y = this.properties.constrainToX ? this.gameObject.getPosition().y : e.position.y;
	
	var dir = 1;
	if (pos.x > this.gameObject.getPosition().x) dir = -1;

	if (this.properties.tiltOnMove) {
		var rotLeft = new lime.animation.RotateBy(25*dir).setDuration(this.properties.rate/2);
		var rotRight = new lime.animation.RotateBy(-25*dir).setDuration(this.properties.rate/2);
		var rotationSeq = new lime.animation.Sequence( [ rotLeft, rotRight] ).setDuration(this.properties.rate);
		
		this.action = new lime.animation.Spawn(rotationSeq, new lime.animation.MoveTo(pos).setDuration(this.properties.rate));
	} else {

		this.action = new lime.animation.MoveTo(pos).setDuration(this.properties.rate);
	}
	
	this.gameObject.runAction( this.action );
	
};

mojo.behavior.moveToTouch.prototype.onAnimationStop = function( e ){
	console.log("moveToTouch onAnimationStop");
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.moveToTouch.prototype.onEnterScene', mojo.behavior.moveToTouch.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.moveToTouch.prototype.onExitScene', mojo.behavior.moveToTouch.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.moveToTouch.prototype.onUpdate', mojo.behavior.moveToTouch.prototype.onUpdate);
goog.exportSymbol('mojo.behavior.moveToTouch.prototype.onMouseUp', mojo.behavior.moveToTouch.prototype.onMouseUp);
goog.exportSymbol('mojo.behavior.moveToTouch.prototype.onMouseDown', mojo.behavior.moveToTouch.prototype.onMouseDown);
