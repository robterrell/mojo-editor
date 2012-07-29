/**
 * @fileoverview This class is just a placeholder for properties that we are using in Dragons
 * @author Rob Terrell
 */

goog.provide('mojo.behavior.entranceAnim');

mojo.behavior.entranceAnim = function(target) {
	mojo.behavior.base.call(this, target);
	this.name = "Entrance Animation";
	this.description = "Properties used by the Entrance Animation";
	this.gameObject = target;
	this.properties = { spawnPosition: {"x":0,"y":0}, moveVector: {"x":1, "y":1}, moveType: "none", timeDelay: 1.0 };
}
goog.inherits(mojo.behavior.entranceAnim, mojo.behavior.base);

