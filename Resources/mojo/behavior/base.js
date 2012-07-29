/**
 * @fileoverview behavior.Base is the base class for all behaviors
 * @author Rob Terrell
 */

goog.provide('mojo.behavior.base');
goog.require('goog.events.KeyHandler');

/**
 * @constructor
 */
mojo.behavior.base = function(target) {
	this.listeners = {};
	this.gameObject = target;
	this.stage = renderContext.scene;
}

/**
 * Adds event listeners for the events we care about
 */

mojo.behavior.base.prototype.attach = function()
{
	this.listeners.start_ = goog.events.listen(renderContext.scene, 'start', this.onStart, false, this);
	this.listeners.stop_ = goog.events.listen(renderContext.scene, 'stop', this.onStop, false, this);
	this.listeners.enterScene = goog.events.listen(renderContext.scene, 'enterScene', this.onEnterScene, false, this);
	this.listeners.exitScene = goog.events.listen(renderContext.scene, 'exitScene', this.onExitScene, false, this);
	this.listeners.mouseup = goog.events.listen(renderContext.scene, ['mouseup','touchend'], this.onMouseUp, false, this);
	this.listeners.mousedown = goog.events.listen(renderContext.scene, ['mousedown', 'touchstart'], this.onMouseDown, false, this);	
	this.listeners.keydown = goog.events.listen(window, 'keydown', this.onKeyDown, true, this);	
	lime.scheduleManager.schedule(this.onUpdate, this);
}

/**
 * Removes the event listeners 
 */
mojo.behavior.base.prototype.detach = function()
{
	goog.events.unlistenByKey(this.listeners['start_']);
	goog.events.unlistenByKey(this.listeners['stop_']);
	goog.events.unlistenByKey(this.listeners['enterScene']);
	goog.events.unlistenByKey(this.listeners['exitScene']);
	goog.events.unlistenByKey(this.listeners['mouseup']);
	goog.events.unlistenByKey(this.listeners['mousedown']);
	goog.events.unlistenByKey(this.listeners['keydown']);
	this.listeners = {};
	lime.scheduleManager.unschedule(this.onUpdate, this);
}

/**
 * base class methods, should be overridden by subclasses
 */

mojo.behavior.base.prototype.onStart = function()
{
	//console.log("base onStart");
};

mojo.behavior.base.prototype.onStop = function()
{
	//console.log("base onStop");
};

mojo.behavior.base.prototype.onEnterScene = function()
{
	//console.log("base onEnterScene");
};

mojo.behavior.base.prototype.onExitScene = function(){
	//console.log("base onExitScene");
};

mojo.behavior.base.prototype.onUpdate = function(deltaTime){
	//console.log("base onUpdate");
};

mojo.behavior.base.prototype.onMouseUp = function( e ){
	//console.log("base onMouseUp");
};

mojo.behavior.base.prototype.onMouseDown = function( e ){
	//console.log("base onMouseDown");
};

mojo.behavior.base.prototype.onAnimationStop = function(){
	//console.log("base onAnimationStop");
};

mojo.behavior.base.prototype.onKeyDown = function()
{
	//console.log("base onStart");
};



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.base.prototype.attach', mojo.behavior.base.prototype.attach);
goog.exportSymbol('mojo.behavior.base.prototype.detach', mojo.behavior.base.prototype.detach);
goog.exportSymbol('mojo.behavior.base.prototype.onEnterScene', mojo.behavior.base.prototype.onEnterScene);
goog.exportSymbol('mojo.behavior.base.prototype.onExitScene', mojo.behavior.base.prototype.onExitScene);
goog.exportSymbol('mojo.behavior.base.prototype.onUpdate', mojo.behavior.base.prototype.onUpdate);
goog.exportSymbol('mojo.behavior.base.prototype.onMouseUp', mojo.behavior.base.prototype.onMouseUp);
goog.exportSymbol('mojo.behavior.base.prototype.onMouseDown', mojo.behavior.base.prototype.onMouseDown);



goog.provide('mojo.scoreBoard');
mojo.scoreBoard = [];
