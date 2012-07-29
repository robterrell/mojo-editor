goog.provide('mojo.behavior.DestroyOnCollision');


mojo.behavior.DestroyOnCollision = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Destroy on Collision";
	this.description = "Removed the object upon collisions with other sprites";
	this.gameObject = target;
	this.properties = { "colliderName": ""};
	this.lastCollider = undefined;
	this.destroyNextUpdate_ = false;
}
goog.inherits(mojo.behavior.DestroyOnCollision, mojo.behavior.collider);

mojo.behavior.DestroyOnCollision.prototype.onUpdate = function() {
	if (this.destroyNextUpdate) renderContext.scene.removeChild(this.gameObject);
}

mojo.behavior.DestroyOnCollision.prototype.onCollision = function( e ) {

//	console.log("DestroyOnCollision onCollision");

	if ( e == this.lastCollider) return; // to avoid overpenetration issues
	this.lastCollider = e;

	if (this.properties.colliderName != "") if (e.name != this.properties.colliderName) return;
	
	// destroy this on the next update, in case other scripts need to get called
	this.destroyNextUpdate = true;
};
