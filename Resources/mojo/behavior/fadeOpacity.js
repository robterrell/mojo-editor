//set main namespace
goog.provide('mojo.behavior.animateOpacity');

goog.require('mojo.behavior.base');
goog.require('lime.animation.FadeTo');

// entrypoint
mojo.behavior.animateOpacity = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Animate Opacity";
	this.description = "";
	this.properties = { "loop": true };
}

goog.inherits(mojo.behavior.animateOpacity, mojo.behavior.base);


mojo.behavior.animateOpacity.prototype.onStart = function()
{
	this.gameObject.setOpacity(0);
	
	var anim = new lime.animation.Loop(
		new lime.animation.Sequence(
			new lime.animation.Delay().setDuration( Math.random()*50/10 ),
			new lime.animation.FadeTo(1).setDuration(1),
			new lime.animation.Delay().setDuration(2),
			new lime.animation.FadeTo(0).setDuration(1)
		)
	);
	
//	var startSeq = new lime.animation.Sequence( new lime.animation.FadeTo(.01).setDuration( Math.random()*3 ), anim );
	
	this.gameObject.runAction(anim);
	
	goog.events.listen(anim, lime.animation.Event.LOOP, this.onAnimationLoop, false, this);

	this.action = anim;
}

//mojo.behavior.animateOpacity.prototype.onStop = function()
//{
//	if (this.action) this.action.stop();
//}

mojo.behavior.animateOpacity.prototype.onAnimationLoop = function()
{
	console.log("onAnimationLoop");
	var p = this.gameObject.getPosition();
	if (p.y < 0) this.gameObject.setPosition( p.x, 430);
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.animateOpacity.onStart', mojo.behavior.animateOpacity.onStart);

