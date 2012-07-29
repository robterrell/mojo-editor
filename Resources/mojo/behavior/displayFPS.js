//set main namespace
goog.provide('mojo.behavior.displayFPS');

goog.require('mojo.behavior.base');
goog.require('lime.Label');

// entrypoint
mojo.behavior.displayFPS = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Display FPS";
	this.description = "Shows the FPS of the game";
	this.gameObject = target;
	this.frames = 0;
	this.accumDt = 0;
	this.fps = 0;
}
goog.inherits(mojo.behavior.displayFPS, mojo.behavior.base);


mojo.behavior.displayFPS.prototype.onUpdate = function(deltaTime)
{
	this.frames++;
	this.accumDt += deltaTime;
	if (this.accumDt > 100) {
		this.fps = ((1000 * this.frames) / this.accumDt);
		this.gameObject.setText(this.fps.toFixed(2));
		this.frames = 0;
		this.accumDt = 0;
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.displayFPS.onUpdate', mojo.behavior.displayFPS.onUpdate);

