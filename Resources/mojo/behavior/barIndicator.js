//set main namespace
goog.provide('mojo.behavior.barIndicator');

goog.require('mojo.behavior.base');
goog.require('lime.Label');

// entrypoint
mojo.behavior.barIndicator = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Bar Indicator";
	this.description = "Shows a progress indicator";
	this.previousScore = 0;
	this.maxValue = 100;
	this.currValue = 0;
}
goog.inherits(mojo.behavior.barIndicator, mojo.behavior.base);

mojo.behavior.barIndicator.prototype.onStart = function(deltaTime)
{
	this.listeners['setProgress'] = goog.events.listen(renderContext.scene, 'setProgress', this.setProgress, false, this);

	this.listeners['setMaxValue'] = goog.events.listen(renderContext.scene, 'setMaxValue', this.setMaxValue, false, this);

	var indicator = new lime.RoundedRect;
	indicator.setSize(100,10);
	indicator.setFill(60,60,60);
	indicator.setAnchorPoint(0,0);
	indicator.setPosition(-40,-52);
	
	var bar = new lime.RoundedRect;
	bar.setAnchorPoint(0,0);
	bar.setSize(0,10);
	bar.setFill(100,100,200);
	indicator.appendChild(bar);			

	this.gameObject.appendChild(indicator);
	this.indicator = indicator;	
	this.bar = bar;
}

mojo.behavior.barIndicator.prototype.onStop = function(deltaTime)
{
	this.gameObject.removeChild(this.indicator);
	goog.events.unlistenByKey(this.listeners['setProgress']);
	goog.events.unlistenByKey(this.listeners['setMaxValue']);
}

mojo.behavior.barIndicator.prototype.setProgress = function(progress)
{
	if (progress) {
		var val = (progress / this.maxValue);
		if (val > 100) val = 100;
		if (val < 0) val = 0;
		this.bar.setSize(val,10);
		this.currValue = max;
	}
}

mojo.behavior.barIndicator.prototype.setMaxValue = function(max)
{
	if (max) {
		this.maxValue = max;
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.barIndicator', mojo.behavior.barIndicator);

