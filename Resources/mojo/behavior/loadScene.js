//set main namespace
goog.provide('mojo.behavior.loadScene');

goog.require('mojo.behavior.base');

// entrypoint
mojo.behavior.loadScene = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Load Scene";
	this.description = "Loads a new scene";
	this.properties = {"scene": ""};
}
goog.inherits(mojo.behavior.loadScene, mojo.behavior.base);

mojo.behavior.loadScene.prototype.onMouseUp = function()
{
	if (this.properties.scene != "") renderContext.loadAndPlayScene(this.properties.scene);
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.loadScene.onMouseUp', mojo.behavior.loadScene.onMouseUp);

