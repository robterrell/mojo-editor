goog.provide('mojo.behavior.motionWithCollider');


mojo.behavior.motionWithCollider = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Motion with Collider";
	this.description = "Detects collisions with other sprites";
	this.gameObject = target;
	this.properties = { "insetX": 0, "insetY":0, "vx":72, "vy":72, "colliderName": ""};
	this.lastCollider = undefined;
	this.ignoreCountdown = 0;
}
goog.inherits(mojo.behavior.motionWithCollider, mojo.behavior.collider);


mojo.behavior.motionWithCollider.prototype.onUpdate = function(deltaTime)
{
	deltaTime /= 1000;
	var p = this.gameObject.getPosition();
	p.x += this.properties.vx * deltaTime;
	p.y += this.properties.vy * deltaTime;
	this.gameObject.setPosition(p);
	
	if (this.ignoreCountdown > 0) this.ignoreCountdown -= deltaTime;

}

mojo.behavior.motionWithCollider.prototype.onCollision = function( e ) {
	
	if (e.name) if (e.name.indexOf("Background") > -1) return;

	// console.log("onCollision " + e.name + ", self: " + r + " hit: " + er );

	if ( e == this.lastCollider) return; // to avoid overpenetration issues

	if (this.ignoreCountdown > 0) { console.log("ignoring collision: " + this.ignoreCountdown); return; }

	if (this.properties.colliderName != "") if (e.name != this.properties.colliderName) return;

	this.lastCollider = e;

	var er = e.getBoundingBox();
	var r = this.gameObject.getBoundingBox(); // todo: use expand to support the insets above!
	var midx = r.left + (r.right - r.left)/2;
	var midy = r.top + (r.bottom - r.top)/2;


	if (er.contains(new goog.math.Box(r.top, r.right, r.bottom, r.right))) { this.properties.vx *= -1;}
	if (er.contains(new goog.math.Box(r.top, r.left, r.bottom, r.left))) { this.properties.vx *= -1; }
	if (er.contains(new goog.math.Box(r.top, r.right, r.top, r.right))) {  this.properties.vy *= -1;}
	if (er.contains(new goog.math.Box(r.bottom, r.right, r.bottom, r.right))) { this.properties.vy *= -1;}

	this.ignoreCountdown = .25;


//	if (er.contains(new goog.math.Coordinate(r.left, midy))) { this.properties.vx *= -1; }
//	if (er.contains(new goog.math.Coordinate(midx, r.top))) {  this.properties.vy *= -1;}
//	if (er.contains(new goog.math.Coordinate(midx, r.bottom))) { this.properties.vy *= -1;}

};
