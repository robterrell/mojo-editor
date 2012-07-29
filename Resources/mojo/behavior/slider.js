//set main namespace
goog.provide('mojo.behavior.slider');

goog.require('mojo.behavior.base');
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

// entrypoint
mojo.behavior.slider = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "SlidesWhenMessaged";
	this.description = "Makes the sprite move when it gets a message";
	this.properties = {"rate": 1.0, message: "foo"};
	this.gameObject = target;
	this.action = undefined;

}
goog.inherits(mojo.behavior.slider, mojo.behavior.base);


mojo.behavior.slider.prototype.onEnterScene = function()
{
	console.log("spinner onEnterScene");
	this.listeners.fire_ = goog.events.listen(renderContext.scene, this.properties.message, this.onFire, false, this);
};

mojo.behavior.slider.prototype.onExitScene = function( e ){
	console.log("spinner onExitScene");
	goog.events.unlistenByKey(this.listeners.fire_);
};


mojo.behavior.slider.onFire = function( e ){
	console.log("slider onFire");
	target.runAction(
		new lime.animation.Sequence(
	    	new lime.animation.MoveBy(60,40).enableOptimizations(),
	    	new lime.animation.MoveBy(-60,-40).enableOptimizations()
		)
	);
};
//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.slider.onFire', mojo.behavior.slider.onFire);

