goog.require('goog.math');
goog.require('goog.math.Vec3');

mojo.behavior.remoteIsoCharacter = null;

goog.provide('mojo.behavior.remoteIsoCharacter');


mojo.behavior.remoteIsoCharacter = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "iso character controller";
	this.description = "iso character controller";
	this.gameObject = target;
	this.properties = { speed: 100 };
	this.moving = false;
	this.gameObject.setAnchorPoint(.5, 1);
	var fill = this.gameObject.getFill();
	this.filename = "http://node.mojo.com:5984/mojo_scenes/9b1c9ecb09c79b6e85e20eed0d000132/WalkFrames_V2.png";
	this.speed = this.properties.speed;
	this.destination = new goog.math.Vec3(20,0,20);
	this.label = new lime.Label();
	this.label.setText('');
	this.label.setFontFamily('Neucha');
	this.label.setFontSize(26);
	this.label.setFontColor('rgb(255,200,255)');
	this.gameObject.appendChild(this.label);

	this.namelabel = new lime.Label();
	this.namelabel.setText('');
	this.namelabel.setFontFamily('Neucha');
	this.namelabel.setFontSize(16);
	this.namelabel.setFontColor('rgb(200,200,255)');
	this.namelabel.setPosition(0,-100);
	this.gameObject.appendChild(this.namelabel);

}



goog.inherits(mojo.behavior.remoteIsoCharacter, mojo.behavior.base);



mojo.behavior.remoteIsoCharacter.prototype.onStart = function()
{
	this.speed = this.properties.speed;
	var b = renderContext.scene.getFrame();
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
	this.gameObject.setIsoPosition(ip.x, ip.y, ip.z);
	
}

mojo.behavior.remoteIsoCharacter.prototype.stopAnimations = function() 
{
	for (var i in anim) {
		this.anim[i].stop();
	}
}

mojo.behavior.remoteIsoCharacter.prototype.initialPosition = function(x,y)
{
	this.destination = this.gameObject.screenToIso(x, y);
	var p = this.gameObject.setIsoPosition(this.destination);
	this.direction = "s";
}


mojo.behavior.remoteIsoCharacter.prototype.moveTo = function(x,y)
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
}


mojo.behavior.remoteIsoCharacter.prototype.stopMoving = function()
{
	console.log("stopMoving");
	this.properties.vx = 0;
}


mojo.behavior.remoteIsoCharacter.prototype.go = function(delta,aName)
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

mojo.behavior.remoteIsoCharacter.prototype.onUpdate = function(deltaTime)
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
		this.moving = false;
		this.properties.vx = 0;
		this.properties.vy = 0;
		this.action = this.anim['stopped_' + this.direction];
		this.gameObject.runAction(this.action);
	}
	
}


mojo.behavior.remoteIsoCharacter.prototype.speak = function( words ) {
	this.label.setText(words);
	this.label.setOpacity(1.0);
	this.label.runAction( new lime.animation.FadeTo(0).setDuration(3.0) );
	
}

mojo.behavior.remoteIsoCharacter.prototype.setName = function (n) 
{
	this.namelabel.setText(n);
}


/////////////



var new_sprite_string = '{"className":"2D.isoSprite","name":"isometric character","position":{"x":-80,"y":-80},"scale":{"x":1,"y":1},"size":{"width":85,"height":90},"opacity":1,"anchorPoint":{"x":0.5,"y":1},"rotation":0,"fill":{"url":"9b1c9ecb09c79b6e85e20eed0d000132/WalkFrames_V2.png","x":0,"y":0,"w":100,"h":100},"behaviors":[{"name":"remoteIsoCharacter","properties":{"speed":100,"vx":0,"vy":0}}],"children":[]}';

var userList = [];
var sprites = {};

now.userListUpdate = function( incomingList ) 
{
	console.log("userListUpdate");
	console.log(incomingList);
	// see if there are any new items in the incoming list
	for (var i=0; i<incomingList.length; i++) 
	{
		var s = incomingList[i];
		if (userList.indexOf(s) == -1) {
			userList.push(s);
			console.log("new user " + s.name + " (" + s.clientId + ")");
			if (s.clientId != now.clientId) {
				sprites[s.clientId] = renderContext.addSceneObject(JSON.parse(new_sprite_string), renderContext.scene, true);
				sprites[s.clientId].behaviors[0].obj.onStart();
				sprites[s.clientId].behaviors[0].obj.setName(s.name);
//				sprites[s.clientId].setPosition(200,200);
				now.getSpritePosition( s.clientId, function(x,y) {
					console.log("getSpritePosition callback: "+ s.clientId + " " + x + ", " + y);
					sprites[s.clientId].initialPosition(x,y);
				});
			}
		}
	}
	// see if there are any deletions
	for (var i=0; i<userList.length; i++) 
	{
		var s = userList[i];
		if (incomingList.indexOf(s) == -1) {
			userList.splice(i,1);
			renderContext.scene.removeChild(sprites[s]);
		}
	}	
}

/*now.userListUpdate = function( incomingList ) 
{
	console.log("userListUpdate");
	console.log(incomingList);
	// see if there are any new items in the incoming list
	for (var i=0; i<incomingList.length; i++) 
	{
		var s = incomingList[i];
		if (userList.indexOf(s) == -1) {
			userList.push(s);
			if (s != now.userName) {
	 			sprites[s] = renderContext.addSceneObject(JSON.parse(new_sprite_string), renderContext.scene, true);
				sprites[s].behaviors[0].obj.onStart();
				sprites[s].behaviors[0].obj.setName(s);
				now.getSpritePosition( s, function(x,y) {
					sprites[s].setPosition(x,y);
				});
			}
		}
	}
	// see if there are any deletions
	for (var i=0; i<userList.length; i++) 
	{
		var s = userList[i];
		if (incomingList.indexOf(s) == -1) {
			userList.splice(i,1);
			renderContext.scene.removeChild(sprites[s]);
		}
	}	
}*/

now.addUser = function ( u ) 
{
	console.log("addUser: " + u.name);
	if (u.clientId == now.clientId) return;
	users.push(u);
	var s = u.clientId;
	sprites[s] = renderContext.addSceneObject(JSON.parse(new_sprite_string), renderContext.scene, true);
	sprites[s].behaviors[0].obj.onStart();
	sprites[s].behaviors[0].obj.setName(u.name);
	sprites[s].setPosition(u.position.x,u.position.y);
}

now.removeUser = function ( u ) 
{
	if (u.clientId == now.clientId) return;
	var idx;
	userList.forEach( function(e,i) { if (e.clientId == u.clientId) idx = i; } );
	if (idx) userList.splice(idx,1);
	var s = u.clientId;
	renderContext.scene.removeChild(sprites[s]);
}

now.moveSpriteTo = function( name, x, y, z) 
{
	console.log(name + " moveSpriteTo: " + x + ", " + y + ", " + z);
//	if (name == undefined) return;

	var o;
	if (name == now.clientId) o = renderContext.getObjectAtIndex(1);
	else o = sprites[name];
	if (o) o.behaviors[0].obj.moveTo(x,y,z);
	else console.warn("sprite not found");
}

now.updateUserPosition = function (clientId, x, y, z)
{
	console.log(clientId + " updateUserPosition: " + x + ", " + y);
	if (clientId == undefined) return;
	var o;
	if (clientId == now.userName) o = renderContext.getObjectAtIndex(1);
	else o = sprites[clientId];
	if (o) o.behaviors[0].obj.moveTo(x,y);
}

var statusLabel;

now.receiveMessage = function(name, id, msg) 
{
	console.log(name + " speak: " + msg);
	var o;
	if (id == now.clientId) o = renderContext.getObjectAtIndex(1);
	else o = sprites[id];
	if (o) o.behaviors[0].obj.speak(msg);
	else console.warn("receiveMessage: can't find sprite " + id);
}

now.core.on("disconnect", function() {
	window.status = "disconnected from server";
	statusLabel.setText('disconnected');
});

now.core.on("connect", function() {
	if (!statusLabel) {
		statusLabel = new lime.Label();
		statusLabel.setPosition(0,0);
		statusLabel.setAnchorPoint(0,0);
		statusLabel.setFontColor('rgb(255,255,0)');
		renderContext.scene.appendChild(statusLabel);
	}
	statusLabel.setText('connected');
});
