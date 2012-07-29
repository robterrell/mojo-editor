//set main namespace
goog.provide('mojo.behavior.mover');

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
mojo.behavior.mover = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Mover";
	this.description = "Applys constant motion to the sprite";
	this.properties = {"rateX": -36.0, "rateY": 0.0, "bounce": false, "wrap": true};
	this.gameObject = target;
	this.maxX = renderContext.scene.getSize().width;
	this.width = this.gameObject.getSize().width;
}
goog.inherits(mojo.behavior.mover, mojo.behavior.base);


mojo.behavior.mover.prototype.onUpdate = function(deltaTime)
{
	deltaTime /= 1000;
	var p = this.gameObject.getPosition();
	if (p.x < -this.width) {
		if (this.properties.wrap) {
			p.x = this.maxX;
		}
		if (this.properties.bounce) {
			this.properties.rateX *= -1;
		}
	} else if (p.x > this.maxX) {
		if (this.properties.wrap) {
			p.x = 0;
		}
		if (this.properties.bounce) {
			this.properties.rateX *= -1;
		}
	}
	p.x += this.properties.rateX * deltaTime;
	p.y += this.properties.rateY * deltaTime;
	this.gameObject.setPosition(p);
}

//mojo.behavior.mover.prototype.onExitScene = function( e ){
//	console.log("mover onExitScene");
//	if (this.action) this.action.stop();
//};


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.mover.onUpdate', mojo.behavior.mover.onUpdate);

