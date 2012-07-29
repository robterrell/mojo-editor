//set main namespace
goog.provide('mojo.behavior.broadcastMessage');

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
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Loop');


mojo.behavior.broadcastMessage = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Broadcast Message";
	this.description = "Sends a message to all objects in the scene when clicked";
	this.properties = {"message": "foo"};
	this.gameObject = target;
	
}
goog.inherits(mojo.behavior.broadcastMessage, mojo.behavior.base);

// entrypoint

mojo.behavior.broadcastMessage.prototype.onMouseUp = function( e ){
	console.log("broadcastMessage fire: " + this.properties.message);
	renderContext.scene.dispatchEvent(this.properties.message);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.broadcastMessage.onMouseUp', mojo.behavior.broadcastMessage.onMouseUp);
