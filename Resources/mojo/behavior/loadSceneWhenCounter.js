//set main namespace
goog.provide('mojo.behavior.loadSceneWhenCounter');

goog.require('mojo.behavior.base');

// entrypoint
mojo.behavior.loadSceneWhenCounter = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Load Scene";
	this.description = "Loads a new scene";
	this.properties = {"scene": "", "counterName": "lives", "counterValue": 0};
	this.done = false;
}
goog.inherits(mojo.behavior.loadSceneWhenCounter, mojo.behavior.base);

mojo.behavior.loadSceneWhenCounter.prototype.onUpdate = function()
{
	if (this.done == false) {
		if (mojo.scoreBoard[this.properties.counterName] == this.properties.counterValue) {
			renderContext.loadAndPlayScene(this.properties.scene);
			this.done = true;
		}
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.loadSceneWhenCounter.onEnterFrame', mojo.behavior.loadSceneWhenCounter.onEnterFrame);

