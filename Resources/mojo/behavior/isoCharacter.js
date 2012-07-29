goog.require('goog.math');
goog.require('goog.math.Vec3');

mojo.behavior.isoCharacter = null;

goog.provide('mojo.behavior.isoCharacter');



mojo.behavior.isoCharacter = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "iso character controller";
	this.description = "iso character controller";
	this.gameObject = target;
	this.properties = { speed: 100 };
	this.moving = false;
	this.gameObject.setAnchorPoint(.5, 1);
	var fill = this.gameObject.getFill();
	this.filename = "http://node.mojo.com:5984/ginorm_scenes/9b1c9ecb09c79b6e85e20eed0d000132/WalkFrames_V2.png";
	this.speed = this.properties.speed;
	this.destination = new goog.math.Vec3(20,0,20);
	this.label = new lime.Label();
	this.label.setText('');
	this.label.setFontFamily('Neucha');
	this.label.setFontSize(28);
	this.label.setFontColor('rgb(200,200,255)');
	this.gameObject.appendChild(this.label);	
	
	this.namelabel = new lime.Label();
	this.namelabel.setText('');
	this.namelabel.setFontFamily('Neucha');
	this.namelabel.setFontSize(16);
	this.namelabel.setFontColor('rgb(255,200,200)');
	this.namelabel.setPosition(0,-100);
	this.gameObject.appendChild(this.namelabel);

}



goog.inherits(mojo.behavior.isoCharacter, mojo.behavior.base);



mojo.behavior.isoCharacter.prototype.onStart = function()
{
	var u = prompt("What is your name?");
	this.speed = this.properties.speed;

	//var b = renderContext.scene.getFrame();
	// create three new sprites for catching clicks
/*	this.upButton = renderContext.addSceneObject( {'className': "2D.Node", 'position': {'top': 0, 'left': 0},  'size': { 'width': b.right, 'height': 60}, fill: "rgb(100,100,200)"} , renderContext.scene);
	this.leftButton = renderContext.addSceneObject( {'className': "2D.Node", 'position': {'top': 60, 'left': 0},  'size': { 'width': 60, 'height': b.bottom} }, renderContext.scene );
	this.rightButton = renderContext.addSceneObject( {className: "2D.Node", position: {top: 60, left: b.right-60},  size: { width: 60, height: b.bottom} }, renderContext.scene );
*/
	// create the animations
	this.anim = {};
	var rowNames = ["se", "s", "sw", "w", "nw", "n", "ne", "e"]; 
	for (var r=0; r<8; r++ ) {
		var n = rowNames[r];
		var a = new lime.animation.KeyframeAnimation();
		for (var i=0; i<8; i++) {
			var x = i * 100;
			var y = r * 100;
//			console.log(n + " adding frame " + r + " x:" + x + " y:" + y);
			var f = new lime.fill.Frame(this.filename, x, y, 100, 100);
			a.addFrame(f);
		}
		this.anim[n] = a.setEasing(lime.animation.Easing.LINEAR);

		var a = new lime.animation.KeyframeAnimation();
		var f = new lime.fill.Frame(this.filename, 400, r*100, 100, 100);
		a.addFrame(f);
		this.anim['stopped_'+n] = a.setEasing(lime.animation.Easing.LINEAR);
	}

	console.log("iso animations:");
	console.log(this.anim);
	this.action = this.anim.stopped_s;
	this.gameObject.runAction(this.action);
	var me = this;
	
	// start the character at the same place the 2d Sprite is on screen
	var p = this.gameObject.getPosition();
	var ip = this.gameObject.screenToIso(p.x,p.y);
	//this.gameObject.setIsoPosition(ip.x, ip.y, ip.z);
	
//	this.gameObject.setPosition(-100,-100);
	
	now.name = u;
	this.spritename = u;
	now.userConnect(u, p.x, p.y);
	this.namelabel.setText(u);
}

mojo.behavior.isoCharacter.prototype.onStop = function()
{
	now.userDisconnect();
}

mojo.behavior.isoCharacter.prototype.stopAnimations = function() 
{
	for (var i in anim) {
		this.anim[i].stop();
	}
}


mojo.behavior.isoCharacter.prototype.onKeyDown = function(e)
{
	switch (e.keyCode) {
		case 32: var s = prompt("Speak:"); now.sendMessage(s); break;
	}
}


mojo.behavior.isoCharacter.prototype.onMouseDown = function(e)
{
	if (this.gameObject.hitTest(e)) {
		var s = prompt("Speak:");
		now.sendMessage(s);
		return;
	}

	this.destination = this.gameObject.screenToIso(e.position.x, e.position.y);
	var p = this.gameObject.getIsoPosition();

//	console.log("click at x: " + this.destination.x + " y: " + this.destination.y + " z: " + this.destination.z);
//	console.log("player at x: " + p.x + " y: " + p.y + " z: " + p.z);

	var delta = goog.math.Coordinate3.difference(p, this.destination,p);
    var angle = Math.atan2(delta.z,delta.x);

	//determine the direction    
	var dir = Math.round(angle/(Math.PI*2)*8); // 8th of the circle
	//var dirs = ['e','ne','n','nw','w','sw','s','se'];
	var dirs = ['nw', 'w','sw','s','se','e','ne','n','nw'];
	if(dir<0) dir=8+dir; //backwards for negative angles
	var dir_name = dirs[dir];
	console.log("angle: " + (angle * 57.2957795) + " dir: " + dir + " name: " + dir_name);
	
	this.direction = dir_name;
//	this.go(delta, dir_name);
	
	now.spriteMoveTo(this.spritename, e.position.x, e.position.y);
}


mojo.behavior.isoCharacter.prototype.pathTo = function(x,y)
{
	var pos = this.gameObject.getPosition();
	console.log(pos);
	this.path = renderContext.findPath(pos.x, pos.y, x, y);
	if (this.path) {
		this.pathIndex = 0;
		var next = this.path[this.pathIndex];
		this.moveTo(next.x*renderContext.pathGridSize, next.y*renderContext.pathGridSize);
	}
}


mojo.behavior.isoCharacter.prototype.moveTo = function(x,y)
{
	this.destination = this.gameObject.screenToIso(x, y);
	var p = this.gameObject.getIsoPosition();

//	console.log("click at x: " + this.destination.x + " y: " + this.destination.y + " z: " + this.destination.z);
//	console.log("player at x: " + p.x + " y: " + p.y + " z: " + p.z);

	var delta = goog.math.Coordinate3.difference(p, this.destination,p);
    var angle = Math.atan2(delta.z,delta.x);

	//determine the direction    
	var dir = Math.round(angle/(Math.PI*2)*8); // 8th of the circle
	//var dirs = ['e','ne','n','nw','w','sw','s','se'];
	var dirs = ['nw', 'w','sw','s','se','e','ne','n','nw'];
	if(dir<0) dir=8+dir; //backwards for negative angles
	var dir_name = dirs[dir];
	console.log("angle: " + (angle * 57.2957795) + " dir: " + dir + " name: " + dir_name);
	
	this.direction = dir_name;
	this.go(delta, dir_name);

//	now.spriteMoveTo(this.spritename, x, y);
}



mojo.behavior.isoCharacter.prototype.stopMoving = function()
{
	console.log("stopMoving");
	this.properties.vx = 0;
}


mojo.behavior.isoCharacter.prototype.go = function(delta,aName)
{		
	var p = this.gameObject.getIsoPosition();
	
	var d = goog.math.Vec3.difference(p, this.destination).normalize().invert();	
	this.properties.vx = d.x;
	this.properties.vy = d.z;
	this.moving = true;
	
	if (aName === 0) return;

	if (this.action) if (this.action != this.anim[aName]) {
		this.action.stop();
		this.action = this.anim[aName];
		this.gameObject.runAction(this.anim[aName]);
	} else { console.log('anim already running'); }
}

mojo.behavior.isoCharacter.prototype.onUpdate = function(deltaTime)
{

	if (this.moving == false) return;
	
	deltaTime /= 1000;
	var p = this.gameObject.getPosition();
	var ip = this.gameObject.getIsoPosition();


	ip.x += this.properties.vx * deltaTime * this.speed;
	ip.z += this.properties.vy * deltaTime * this.speed;

	this.gameObject.setIsoPosition(ip.x, ip.y, ip.z);

	var dist = goog.math.Vec3.distance(this.destination, ip);
	var at_goal =  dist <= 50;

	// if has reached goal position
	if (at_goal) {
		if (this.path != undefined) {
			this.pathIndex += 1;
			if (this.pathIndex < this.path.length) {
				var next = this.path[this.pathIndex];
				if (next == undefined) return;
				this.moveTo(next.x*renderContext.pathGridSize, next.y*renderContext.pathGridSize);
				return;
			}
		}
		this.moving = false;
		this.properties.vx = 0;
		this.properties.vy = 0;
		this.action = this.anim['stopped_' + this.direction];
		this.gameObject.runAction(this.action);
	}
}


/*mojo.behavior.isoCharacter.prototype.onCollision = function( e ) {
	
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
*/

mojo.behavior.isoCharacter.prototype.speak = function( words ) {
	this.label.setText(words);
	this.label.setOpacity(1.0);
	this.label.runAction( new lime.animation.FadeTo(0).setDuration(3.0) );
	
}

mojo.behavior.isoCharacter.prototype.onCollisionExit = function( e ) {
	this.lastCollider = null;
}


mojo.behavior.isoCharacter.prototype.onAnimationStop = function( e ){
	console.log("isoCharacter onAnimationStop");
};
