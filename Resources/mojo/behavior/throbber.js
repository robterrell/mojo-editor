//set main namespace
goog.provide('mojo.behavior.throbber');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Sprite');
goog.require('lime.RoundedRect');
goog.require('lime.Polygon');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.Loop');


// entrypoint
mojo.behavior.throbber = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Throbber";
	this.description = "Makes the sprite bigger and smaller";
	this.properties = {"duration": 1.0, "max": 1.25, "min":.75, "triggers": ["onCollision"], "repeatCount": 1};
	this.gameObject = target;
	this.action = undefined;
}

goog.inherits(mojo.behavior.throbber, mojo.behavior.collider);

mojo.behavior.throbber.prototype.onStart = function()
{
	console.log("throbber onStart");
	if (this.properties.triggers.indexOf("onStart")>-1) this.throb();
};

mojo.behavior.throbber.prototype.onCollision = function()
{
	console.log("throbber onCollision");
	if (this.properties.triggers.indexOf("onCollision")>-1) this.throb();
};

mojo.behavior.throbber.prototype.throb = function()
{
	console.log("throbber throb");
	if (this.action) {
		// this action has run before, so re-run it
		if (this.action.isPlaying_) { 
			// already playing, do nothing
			return; 
		}
		else {
			this.gameObject.runAction(this.action); 
			return;
		}
	}
	// never before run -- set it up to go!
	this.action = new lime.animation.Loop(
		new lime.animation.Sequence(
	    	new lime.animation.ScaleTo(this.properties.max),
	    	new lime.animation.ScaleTo(this.properties.min)
	    )
	).setLimit(this.properties.repeatCount);
	this.gameObject.runAction(this.action);
};


mojo.behavior.throbber.prototype.onStop = function()
{
	console.log("throbber onStop");
	if (this.action) {
		this.action.stop();
		this.action = undefined;
	}
};

goog.exportSymbol('mojo.behavior.throbber.prototype.onStart', mojo.behavior.throbber.prototype.onStart);
goog.exportSymbol('mojo.behavior.throbber.prototype.onStop', mojo.behavior.throbber.prototype.onStop);
