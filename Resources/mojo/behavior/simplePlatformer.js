goog.provide('mojo.behavior.simplePlatformController');

mojo.behavior.simplePlatformController = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Simple Platform Controller";
	this.description = "Basic platformer controller";
	this.gameObject = target;
	this.properties = { "insetX": 0, "insetY":0, "vx": 0, "vy": 0, "groundCollider": "ground", "gravity": 10};
	this.lastCollider = undefined;
	this.falling = true;
	this.wasFalling = false;
	this.gameObject.setAnchorPoint(.5, 1);
	this.filename = "http://localhost:5984/mojo_scenes/5915129a13e67e8b43500c887e007013/platformer_sprites_pixelized_0.png";
	this.animationData = {
       "stand": [
           {
               "x": 0,
               "y": 512,
               "w": 64,
               "h": 64
           }
       ],
       "run": [
           {
               "x": 256,
               "y": 0,
               "w": 64,
               "h": 64
           },
           {
               "x": 320,
               "y": 0,
               "w": 64,
               "h": 64
           },
           {
               "x": 384,
               "y": 0,
               "w": 64,
               "h": 64
           },
           {
               "x": 448,
               "y": 0,
               "w": 64,
               "h": 64
           },
           {
               "x": 0,
               "y": 64,
               "w": 64,
               "h": 64
           },
           {
               "x": 64,
               "y": 64,
               "w": 64,
               "h": 64
           },
           {
               "x": 128,
               "y": 64,
               "w": 64,
               "h": 64
           },
           {
               "x": 192,
               "y": 64,
               "w": 64,
               "h": 64
           }
       ],
       "jump": [
           {
               "x": 256,
               "y": 320,
               "w": 64,
               "h": 64
           },
           {
               "x": 320,
               "y": 320,
               "w": 64,
               "h": 64
           },
           {
               "x": 386,
               "y": 320,
               "w": 64,
               "h": 64
           },
           {
               "x": 448,
               "y": 320,
               "w": 64,
               "h": 64
           }
       ]
   };
}

goog.inherits(mojo.behavior.simplePlatformController, mojo.behavior.collider);



mojo.behavior.simplePlatformController.prototype.onStart = function()
{
	var b = renderContext.scene.getFrame();
	// create three new sprites for catching clicks
	this.upButton = renderContext.addSceneObject( {'className': "2D.Node", 'position': {'top': 0, 'left': 0},  'size': { 'width': b.right, 'height': 60}, fill: "rgb(100,100,200)"} , renderContext.scene);
	this.leftButton = renderContext.addSceneObject( {'className': "2D.Node", 'position': {'top': 60, 'left': 0},  'size': { 'width': 60, 'height': b.bottom} }, renderContext.scene );
	this.rightButton = renderContext.addSceneObject( {className: "2D.Node", position: {top: 60, left: b.right-60},  size: { width: 60, height: b.bottom} }, renderContext.scene );

	// create the animations
	this.anim = {};
	var keys = Object.keys(this.animationData);
	for (var key in this.animationData) {
		var a = new lime.animation.KeyframeAnimation();
		var frames = this.animationData[key];
		for (idx in frames) {
			if (frames.hasOwnProperty(idx)) {
				console.log(key + " adding frame " + idx + " x:" + frames[idx].x + " y:" + frames[idx].y);
				var f = new lime.fill.Frame(this.filename, frames[idx].x, frames[idx].y, frames[idx].w, frames[idx].h);
				a.addFrame(f);
			}
		}
		this.anim[key] = a.setEasing(lime.animation.Easing.LINEAR);
	}
	console.log(this.anim);
	this.action = this.anim.jump;
	this.gameObject.runAction(this.action);
	var me = this;
	window.setTimeout(function() { console.log("stopping jump"); me.anim.jump.stop(); }, 300);
}

mojo.behavior.simplePlatformController.prototype.stopAnimations = function() 
{
	for (var i in anim) {
		this.anim[i].stop();
	}
}

mojo.behavior.simplePlatformController.prototype.onKeyDown = function(e)
{
	switch (e.keyCode) {
	
		case 38: // up 
			this.jump(); break;

		case 40: // down
			this.stopMoving(); break;

		case 37: // Left
			this.goLeft(); break;
		
		case 39: // right
			this.goRight(); break;
			
	}
	
}


mojo.behavior.simplePlatformController.prototype.onMouseDown = function(e)
{
	if (this.gameObject.hitTest(e)) this.jump();
	else if (this.leftButton.hitTest(e)) this.goLeft();
	else if (this.rightButton.hitTest(e)) this.goRight();
}


mojo.behavior.simplePlatformController.prototype.stopMoving = function()
{
	console.log("stopMoving");
	this.properties.vx = 0;
}

mojo.behavior.simplePlatformController.prototype.goLeft = function()
{
	console.log("goLeft");
	this.properties.vx = -60;
	this.gameObject.setScale(-1,1);
	
	if (this.action) if (this.action != this.anim.run) {
		this.action.stop();
		this.action = this.anim.run;
		this.gameObject.runAction(this.anim.run);
	} else { console.log('anim already running'); }
}

mojo.behavior.simplePlatformController.prototype.goRight = function()
{
	console.log("goRight");
	this.properties.vx = 60;
	this.gameObject.setScale(1,1);

	if (this.action) if (this.action != this.anim.run) {
		this.action.stop();
		this.action = this.anim.run;
		this.gameObject.runAction(this.action);
	} else { console.log('anim already running'); }
}


mojo.behavior.simplePlatformController.prototype.jump = function()
{
	console.log("jump");
	this.falling = true;
	this.gameObject.setPositionOffset(0,-1);
	this.properties.vy -= this.properties.gravity * 30;
	if (this.action) this.action.stop();
	this.action = this.anim.jump;
	this.gameObject.runAction(this.action);
	var me = this;
	// lime bug -- can't stop keyframe animations from looping, so stop it with a timer
	window.setTimeout(function() { console.log("stopping jump"); me.anim.jump.stop(); }, 300);
}


mojo.behavior.simplePlatformController.prototype.onUpdate = function(deltaTime)
{
	deltaTime /= 1000;
	var p = this.gameObject.getPosition();
	
	if (this.falling) {
		this.properties.vy += this.properties.gravity;
		this.properties.vy = Math.min(260, this.properties.vy);
	}
	else this.properties.vy = 0;
	
	// if (this.falling) console.log("falling");
	
	p.x += this.properties.vx * deltaTime;
	p.y += this.properties.vy * deltaTime;
	
	this.gameObject.setPosition(p);
	
//	if ( this.wasFalling==false && this.falling) {
//		// started falling
//		console.log("start falling");
//		if (this.action) this.action.stop();
//		this.action = this.anim.jump;
//		this.gameObject.runAction(this.action);
//		var me = this;
//		// lime bug -- can't stop keyframe animations from looping, so stop it with a timer
//		window.setTimeout(function() { console.log("stopping jump"); me.anim.jump.stop(); }, 300);
//	}		

	this.wasFalling = this.falling;

	this.falling = true;

}


mojo.behavior.simplePlatformController.prototype.onCollision = function( e ) {
	
	if ( e == this.lastCollider) {
		if (e.name == this.properties.groundCollider) this.falling = false;
		return; // to avoid overpenetration issues
	}
	this.lastCollider = e;
	
	console.log("onCollision " + e.name);
	if (e.name == this.properties.groundCollider) {
		this.falling = false;
		var p = this.gameObject.getPosition();
		var ep = e.getBoundingBox();
		this.gameObject.setPosition(p.x, ep.top);
		this.action.stop();
		this.properties.vx = 0;
		this.action = new lime.animation.Loop(this.anim.stand);
		this.gameObject.runAction(this.action);
	}

};


mojo.behavior.simplePlatformController.prototype.onCollisionExit = function( e ) {
	this.lastCollider = null;
}


mojo.behavior.simplePlatformController.prototype.onAnimationStop = function( e ){
	console.log("simplePlatformController onAnimationStop");
};
