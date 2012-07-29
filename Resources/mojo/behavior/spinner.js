//set main namespace
goog.provide('mojo.behavior.spinner');

goog.require('mojo.behavior.base');
goog.require('lime.Sprite');
goog.require('lime.animation.RotateBy');
goog.require('lime.animation.Loop');


mojo.behavior.spinner = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Spinner";
	this.description = "Spins the sprite it's attached to";
	this.properties = {"rate": 1.0, "delta": 3};
	this.gameObject = target;
//	this.listener = {};
}

goog.inherits(mojo.behavior.spinner, mojo.behavior.base);

mojo.behavior.spinner.prototype.onEnterScene = function()
{
	console.log("spinner onEnterScene");
	this.action = new lime.animation.Loop(new lime.animation.RotateBy(this.properties.delta).setDuration(this.properties.rate).setEasing(lime.animation.Easing.LINEAR));
	this.gameObject.runAction( this.action );
};

mojo.behavior.spinner.prototype.onExitScene = function( e ){
	console.log("spinner onExitScene");
	this.action.stop();
};

mojo.behavior.spinner.prototype.onUpdate = function( e ){
	console.log("spinner onUpdate");
};

mojo.behavior.spinner.prototype.onMouseUp = function( e ){
	console.log("spinner onMouseUp");
	console.log(this);
};

mojo.behavior.spinner.prototype.onMouseDown = function( e ){
	console.log("spinner onMouseDown");
};

mojo.behavior.spinner.prototype.onAnimationStop = function( e ){
	console.log("spinner onAnimationStop");
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.spinner.prototype.onEnterScene', mojo.behavior.spinner.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.spinner.prototype.onExitScene', mojo.behavior.spinner.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.spinner.prototype.onUpdate', mojo.behavior.spinner.prototype.onUpdate);
goog.exportSymbol('mojo.behavior.spinner.prototype.onMouseUp', mojo.behavior.spinner.prototype.onMouseUp);
goog.exportSymbol('mojo.behavior.spinner.prototype.onMouseDown', mojo.behavior.spinner.prototype.onMouseDown);


/*mojo.behavior.spinner.prototype.attach = function()
{
	this.listener.enterScene = goog.events.listen(renderContext.scene, 'enterScene', this.onEnterScene, false, this);
	this.listener.exitScene = goog.events.listen(renderContext.scene, 'exitScene', this.onExitScene, false, this);
	this.listener.update = goog.events.listen(renderContext.scene, 'update', this.onUpdate, false, this);
	this.listener.mouseup = goog.events.listen(renderContext.scene, 'mouseup', this.onMouseUp, false, this);
	this.listener.mousedown = goog.events.listen(renderContext.scene, 'mousedown', this.onMouseDown, false, this);
}

mojo.behavior.spinner.prototype.detach = function()
{
	goog.events.unlistenByKey(this.listener['enterScene']);
	goog.events.unlistenByKey(this.listener['exitScene']);
	goog.events.unlistenByKey(this.listener['update']);
	goog.events.unlistenByKey(this.listener['mouseup']);
	goog.events.unlistenByKey(this.listener['mousedown']);
}*/

