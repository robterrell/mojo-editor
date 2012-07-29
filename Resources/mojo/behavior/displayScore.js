//set main namespace
goog.provide('mojo.behavior.displayScore');

goog.require('mojo.behavior.base');
goog.require('lime.Label');

// entrypoint
mojo.behavior.displayScore = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Display Score";
	this.description = "Shows the current score for a given player";
	this.properties = { "player": "Player 1"};
	this.previousScore = 0;
}
goog.inherits(mojo.behavior.displayScore, mojo.behavior.base);


mojo.behavior.displayScore.prototype.onUpdate = function(deltaTime)
{
	if (mojo.scoreBoard[this.properties.player] != this.previousScore) {
		if (this.gameObject.id == "label") {
			this.gameObject.setText(""+ mojo.scoreBoard[this.properties.player])
			this.previousScore = mojo.scoreBoard[this.properties.player];
		}
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.displayScore.onUpdate', mojo.behavior.displayScore.onUpdate);

