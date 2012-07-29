goog.provide('mojo.behavior.motionWithFlipCollider');


mojo.behavior.motionWithFlipCollider = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Motion with Collider, Flip ";
	this.description = "Detects collisions with other sprites";
	this.gameObject = target;
	this.properties = { "insetX": 0, "insetY":0, "vx":72, "vy":72, "colliderName": ""};
	this.lastCollider = undefined;
	this.ignoreCountdown = 0;
}
goog.inherits(mojo.behavior.motionWithFlipCollider, mojo.behavior.collider);


mojo.behavior.motionWithFlipCollider.prototype.onUpdate = function(deltaTime)
{
	deltaTime /= 1000;
	var p = this.gameObject.getPosition();
	p.x += this.properties.vx * deltaTime;
	p.y += this.properties.vy * deltaTime;
	this.gameObject.setPosition(p);
	
	if (this.ignoreCountdown > 0) this.ignoreCountdown -= deltaTime;
}

mojo.behavior.motionWithFlipCollider.prototype.onCollision = function( e ) {

	if ( e == this.lastCollider) return; // to avoid overpenetration issues

	if (this.ignoreCountdown > 0) return;

	this.lastCollider = e;
	
	var er = e.getBoundingBox();
	var r = this.gameObject.getBoundingBox(); // todo: use expand to support the insets above!
	var midx = r.left + (r.right - r.left)/2;
	var midy = r.top + (r.bottom - r.top)/2;
//	console.log("onCollision " + e.name + ", self: " + r + " hit: " + er );

	if (this.properties.colliderName != "") if (e.name != this.properties.colliderName) return;

	var xs = this.gameObject.getScale().x;
	if (er.contains(new goog.math.Coordinate(r.right, midy))) { this.properties.vx *= -1; this.gameObject.setScale(xs*-1,1);}
	if (er.contains(new goog.math.Coordinate(r.left, midy))) { this.properties.vx *= -1; this.gameObject.setScale(xs*-1,1);}
	if (er.contains(new goog.math.Coordinate(midx, r.top))) {  this.properties.vy *= -1;}
	if (er.contains(new goog.math.Coordinate(midx, r.bottom))) { this.properties.vy *= -1;}

	this.ignoreCountdown = .5;
};
