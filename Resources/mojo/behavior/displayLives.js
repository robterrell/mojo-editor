//set main namespace
goog.provide('mojo.behavior.displayLives');

goog.require('mojo.behavior.base');
goog.require('lime.Label');

// entrypoint
mojo.behavior.displayLives = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Display Score";
	this.description = "Shows the number of lives for a given player";
	this.properties = { "player": "Player1lives", "gameOverScene": "gameover"};
	this.previousLives = 0;
}
goog.inherits(mojo.behavior.displayLives, mojo.behavior.base);


mojo.behavior.displayLives.prototype.onUpdate = function(deltaTime)
{
	if (mojo.scoreBoard[this.player] != this.previousLives) {
		if (this.gameObject.id == "label") {
			this.gameObject.setText(""+ mojo.scoreBoard[this.properties.player])
			this.previousScore = mojo.scoreBoard[this.properties.player];
		}
		if (this.previousScore==0) {
			if (this.properties.gameOverScene!='') renderContext.loadAndPlayScene(this.properties.gameOverScene);
		}
		// reset ball
		
		
	}
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('mojo.behavior.displayLives.onUpdate', mojo.behavior.displayLives.onUpdate);

