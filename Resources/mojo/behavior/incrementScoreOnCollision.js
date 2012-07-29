goog.provide('mojo.behavior.incrementScoreOnCollision');

mojo.behavior.incrementScoreOnCollision = function(target) {
	mojo.behavior.collider.call(this, target);
	this.name = "Increment Score on Collision";
	this.description = "Changes the score upon collisions with other sprites";
	this.gameObject = target;
	this.properties = { "player": "Player 1", "increment": 1, "colliderName": ""};
	this.lastCollider = undefined;
}
goog.inherits(mojo.behavior.incrementScoreOnCollision, mojo.behavior.collider);

mojo.behavior.incrementScoreOnCollision.prototype.onStart = function() {
	mojo.scoreBoard[this.properties.player] = 0;
}

mojo.behavior.incrementScoreOnCollision.prototype.onCollision = function( e ) {

//	console.log("incrementScoreOnCollision onCollision");

	if ( e == this.lastCollider) return; // to avoid overpenetration issues
	this.lastCollider = e;

	if (this.properties.colliderName != "") if (e.name != this.properties.colliderName) return;
	
	mojo.scoreBoard[this.properties.player] += this.properties.increment;
	
};
