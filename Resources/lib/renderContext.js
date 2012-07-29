//set main namespace
goog.provide('renderContext');


//get requirements
goog.require('goog.events');
goog.require('lime.Director');
goog.require('lime.CoverNode');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Sprite');
goog.require('lime.Button');
goog.require('lime.RoundedRect');
goog.require('lime.Polygon');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ColorTo');
goog.require('lime.fill.Frame');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.SpriteSheet');
goog.require('lime.ui.Scroller');
goog.require('lime.fill.LinearGradient');

// for playback
goog.require('lime.transitions.Dissolve');
goog.require('goog.net.XhrIo'); 
goog.require('goog.Uri'); 

goog.require('mojo.util');
goog.require('mojo.isoSprite');

var behaviorMap;


// entrypoint
renderContext.start = function( e, w, h ){

	this.DOMElement = e;
	var director = new lime.Director(e,w,h),
	    scene = new lime.Scene();	
    	scene.setAutoResize(lime.AutoResize.ALL);

	// set current scene active
	director.replaceScene(scene);
	director.setDisplayFPS(false);
	
	this.scene = scene;

	this.director = director;
	
	this.playbackScene = new lime.Scene();
	
	e.style.backgroundImage = "url('Resources/Checkerboard.png')";
	
	this.orderDirty_ = false;
	
	this.backgroundImage = "";
	
	this.prefabs = {};
	
	this.animations = {};
}

renderContext.setOrderDirty = function(b)
{
	this.orderDirty_ = b;
}


// Functions called by the editor 

renderContext.prepareToPlay = function()
{
	this.DOMElement.style.backgroundImage = '';
	this.DOMElement.style.backgroundColor= 'rgb(255,255,255)';
	this.scene.setOpacity(1.0);
}


renderContext.prepareToEdit = function()
{
	this.DOMElement.style.backgroundImage = "url('Resources/Checkerboard.png')";
	this.scene.setOpacity(.9);
}


renderContext.serializeContext = function()
{
	return this.scene.serialize();
}


renderContext.objectifyContext = function()
{
	return this.scene.objectify();
}


renderContext.clearScene = function()
{
	var scene = new lime.Scene();	
	scene.setAutoResize(lime.AutoResize.ALL);
	this.director.replaceScene(scene);
	this.scene = scene;
}


renderContext.getPrimitives = function()
{
	return [
		{"name": "Empty GameObject", "value": "2D.Sprite"},
//		{"name": "Button", "value": "2D.Button"},
		{"name": "Sprite", "value": "2D.Sprite"},
		{"name": "Rectangle", "value": "2D.Sprite"},
		{"name": "Rounded Rect", "value": "2D.RoundedRect"},
		{"name": "Circle", "value": "2D.Circle"},
		{"name": "Label", "value": "2D.Label"},
		{"name": "Isometric Sprite", "value": "2D.isoSprite"}
	];
}


// Functions called by the player and by the editor

renderContext.resize = function(w,h)
{
	var d = new lime.Director(this.DOMElement,w,h);
	if (this.director) {
		d.setScale(this.director.getScale() | 1.0);
		d.setDisplayFPS(NO);
	}
	d.replaceScene(this.scene);
	this.director = d;
}


renderContext.setSize = function(w,h) 
{
	renderContext.director.setSize(w, h);
}


renderContext.addSceneObject = function(o,p, att)
{
    var target;
    switch (o.className) {
        case "lime.Button":
        case "2D.Button":  target = new lime.Sprite(); break;
        case "lime.Circle": 
        case "2D.Circle": target = new lime.Circle(); break;
        case "lime.Label": 
        case "2D.Label": target = new lime.Label(); break;
        case "lime.RoundedRect":
        case "2D.RoundedRect":  target = new lime.RoundedRect(); break;
        case "2D.Node":
        case "lime.Node": target = new lime.Sprite(); break;
        case "lime.Sprite":
        case "2D.Sprite":  target = new lime.Sprite(); break;
        case "2D.isoSprite": target = new mojo.isoSprite(); break;
//        case "2D.Node":  target = new lime.Node(); break;
    }
    if (target != undefined) {
		if (o.position) target.setPosition(o.position);
		if (o.scale) target.setScale(o.scale.x, o.scale.y);
		if (o.hasOwnProperty('fill')) {
			if (o.fill) {
				if (o.fill.url) {
					// Ginorm pre-alpha versions included full paths, so we must purge them 
					//o.fill.url.replace("http://localhost:5984/ginorm_scenes", "");
					//o.fill.url = serverInfo.baseUrl + "/" + mojo.getPathOfUrl(o.fill.url);
					//console.log("fill url modified to: " + o.fill.url);
					if (o.fill.url.indexOf(serverInfo.databaseName) == 0) o.fill.url = serverInfo.baseUrl + o.fill.url;
					if (o.fill.hasOwnProperty('x')) {
						target.setFill(new lime.fill.Frame(o.fill.url, o.fill.x, o.fill.y, o.fill.w, o.fill.h));
					} 
					else target.setFill(new lime.fill.Image(o.fill.url));
				}
				else if (o.fill.str) target.setFill(o.fill.str);
				else target.setFill(o.fill);
			}
		}
/*		if (o.animations) {
			for (var idx in o.animations) {
				var anim = o.animations[idx];
				var 
			}
		}
*/

		if (o.size) target.setSize(o.size.width, o.size.height);
		if (o.anchorPoint) target.setAnchorPoint(o.anchorPoint.x, o.anchorPoint.y);
		if (o.opacity) target.setOpacity(o.opacity);
		if (o.rotation) target.setRotation(o.rotation);
		if (o.text) target.setText(o.text);
		if (o.fontSize) target.setFontSize(o.fontSize);
		if (o.fontFamily) target.setFontFamily(o.fontFamily);
		if (o.fontWeight) target.setFontWeight(o.fontWeight);
		if (o.fontColor) target.setFontColor(o.fontColor);
		if (o.fontAlign) target.setAlign(o.fontAlign);
		if (o.name) target.name = o.name;
		
		if (o.entityID) target.entityID = o.entityID;
		if (o.isColored) target.isColored = o.isColored;
		
		if (o.className == "2D.Button") {

			var d = new lime.Sprite();
			d.setSize(o.size.width, o.size.height);
			d.setFill( o.fill.url );
			d.setRenderer(lime.Renderer.CANVAS);
			//d.getFill().setTint("#CCCCCC");
			
			var b = new lime.Button( target, d );

			b.setPosition(target.getPosition());
			target.setPosition(0,0);
			
			if (o.size) b.setSize(o.size.width, o.size.height);
			if (o.anchorPoint) b.setAnchorPoint(o.anchorPoint.x, o.anchorPoint.y);
			if (o.opacity) b.setOpacity(o.opacity);
			if (o.rotation) b.setRotation(o.rotation);
			if (o.text) b.setText(o.text);
			if (o.fontSize) b.setFontSize(o.fontSize);
			if (o.fontFamily) b.setFontFamily(o.fontFamily);
			if (o.fontWeight) b.setFontWeight(o.fontWeight);
			if (o.fontColor) b.setFontColor(o.fontColor);
			if (o.fontAlign) b.setAlign(o.fontAlign);
			if (o.name) b.name = o.name;
	
			target = b;
		}

		if (o.behaviors) {
			for (i=0; i< o.behaviors.length; i++) {
				var bmap = o.behaviors[i];
				var s = bmap.name;
				if (Object.keys(behaviorMap).indexOf(s) == -1) { alert("Missing behavior: " + s); continue;}
				var ctor = behaviorMap[s];
				var b = new ctor(target);
//				console.log(bmap);
//				console.log(b);
				for (var a in bmap.properties) {
//					console.log("property " +a+ " setting to value: "+ bmap.properties[a]);
					b.properties[a] = bmap.properties[a];
				}
				//b.properties = bmap.properties;
				//console.log("added "+s+" with properties "+JSON.stringify(b.properties));
				var oo = {"name": s, "obj": b};
				if (!target.behaviors) target.behaviors = [];
				target.behaviors.push(oo);
				if (att) b.attach();
			}
		}

		p.appendChild(target);

//		console.log("created " + o.className);
	} else console.warn("class not found", o.className )
	
	return target;
}


renderContext.removeSceneObject = function(o)
{
	this.scene.removeChild(o);
}


renderContext.getObjects = function()
{
	return this.scene.children_;
}


renderContext.getObjectAtIndex = function(i)
{
	return this.scene.children_[i];
}


renderContext.getChildAtIndex = function(obj, i)
{
	return obj.children_[i];
}


renderContext.getObjectByGUID = function(g) {
	
}


renderContext.getObjectsOfType = function(t)
{
	// TODO: rewrite this, since reduce() is only in FF at the moment
	// return this.scene.children_.reduce(function(e) { if (e.className == t) return e;});
	
	// note: using map twice, once to reduce to the desired data, and then again to remove the empty array items
	// using map() twice should be faster than a JS function, since it's implemented natively
	//return this.scene.children_.map(function(e) { if (e.className == t) return e;}).map(function(e) { return e} );
	
	// note: safari/chrome doesn't remove the empty array items as per the spec. ARRGGHH! 
	// rewrite from scratch as (sigh) a JS function
	// keeping above lines in case JSCore becomes sane before we ship.

	var r = [];
	var l = renderContext.scene.children_.length;
	for (var i=0; i<l; i++) {
		if (renderContext.scene.children_[i].className == t) r.push(renderContext.scene.children_[i]);
	}
	return r;
}

renderContext.sortIsoObjects = function()
{
	// get just the iso objects
	var r = [];
	var firstIsoIndex = -1;
	var l = renderContext.scene.children_.length;
	for (var i=0; i<l; i++) {
		if (renderContext.scene.children_[i].className == "2D.isoSprite") {
			if (firstIsoIndex == -1) firstIsoIndex = i;
			r.push(renderContext.scene.children_[i]);
		}
	}
	// apply iso sorting algorithm 
	// note: this is not a great algorithm
	r.forEach(function(e) { e.isoSortDepth = e.coordinate.x + e.coordinate.z * e.getSize().width - (e.coordinate.y * e.getSize().width); } );
	// sort these by depth
	r.sort(function (a,b) { return a.isoSortDepth - b.isoSortDepth; } );
	// apply sort to parent's sprite ordering
	r.forEach(function(e,i) { renderContext.scene.setChildIndex(e, firstIsoIndex + i); } );
}

// following function based on as3isolib's DefaultSceneLayoutRenderer
renderContext.betterSortIsoObjects = function()
{
	var r = [];
	var firstIsoIndex = -1;
	var l = renderContext.scene.children_.length;
	for (var i=0; i<l; i++) {
		if (renderContext.scene.children_[i].className == "2D.isoSprite") {
			if (firstIsoIndex == -1) firstIsoIndex = i;
			r.push(renderContext.scene.children_[i]);
		}
	}
	// apply iso sorting algorithm 
	// note: this is not a very advanced algorithm; it doesn't account for up-axis (i.e. the Y axis)
	r.forEach(function(e) { e.isoSortDepth = e.coordinate.x + e.coordinate.z * e.getSize().width; } );
	// sort these by depth
	r.sort(function (a,b) { return a.isoSortDepth - b.isoSortDepth; } );
	// apply sort to parent's sprite ordering
	r.forEach(function(e,i) { renderContext.scene.setChildIndex(e, firstIsoIndex + i); } );
}



renderContext.getObjectBehavior = function (i, item) {
	// item = be the name (string) of the behavior
	// find the behavior by its name
	var bindex = selectionProps.behaviors.map(function(e) {return e.name;}).indexOf(item);
	if (bindex == -1) return nil;
	
	var behavior = selectionProps.behaviors[bindex];
	if (behavior == undefined) {
		//console.log("behavior at index " + index + " is undefined");
		//console.log(selectionProps);
		return nil;
	}
	return behavior;
}


renderContext.instantiatePrefabNamed = function ( name, position_, rotation_ )
{
	var o = this.prefabs[name];
	var t = renderContext.addSceneObject( o );
	if (position_) t.setPosition(position_);
	if (rotation_) t.setRotation(rotation_);
	return t;
}

renderContext.instantiatePrefab = function ( o )
{
	var t = renderContext.addSceneObject( o, renderContext.scene, true );
	
	t.behaviors[0].obj.onEnterScene();
	
	return t;
}


/*renderContext.loadAnimation = function( o, base )
{
	var r = {};
	var frames = [], animations = [];
	if (o.asset_type != "image") return;
	var file = Object.keys(o._attachments)[0];
	r.filename = base + "/" + o._id + "/" + file;
	if (o.frames) {
		var names = Object.keys(o.frames);
		for (i=0; i<o.frames.length; i++)
		{
			var f = new lime.fill.Frame(r.filename, o.frames[i].x, o.frames[i].y, o.frames[i].w, o.frames[i].h); 
			frames.push({"name": names[i], frame: f});
		}
	}
	if (o.animations) {
		var names = Object.keys(o.animations);
		for (i=0; i<o.animations.length; i++)
		{
			var anim = new lime.animation.KeyframeAnimation();
			var f = new lime.fill.Frame(r.filename, o.frames[i].x, o.frames[i].y, o.frames[i].w, o.frames[i].h); 
			frames.push({"name": names[i], frame: f});
		}
	}
}*/

// NOTE the following function is intended for playback use only!
// if you find you want to use it in the editor, it needs to be tested
// for that, update the GUI, etc. -- RMT

// TODO: this is not recursive, so child sprites will be skipped!

renderContext.loadAndPlayScene = function( scene_name )
{
	// check for the behaviorMap, in case this is the first run
	if (!behaviorMap) {
		behaviorMap = {}; 
		var keys = Object.keys(mojo.behavior)
		for (var i=0; i<keys.length; i++) {
			var name = keys[i];
			if (name != "base") {
				behaviorMap[name] = mojo.behavior[name];				
			}
		}
	}
	
	// for the outgoing scene
	if (renderContext.scene) renderContext.scene.dispatchEvent({type:'exitScene'});

	var url = serverInfo.baseUrl +  serverInfo.databaseName + "/" + scene_name + "?callback=loadandplaycallback";
	console.log("loading scene " + url);
	mojo.jsonp(url);
//	goog.net.XhrIo.send( url, function(event) { 
//	}); 
}

loadandplaycallback = function(data)
{
	console.log("loaded: "+data._id+" revision: "+ data._rev);
	console.log(data.scene);
	if (! data.scene) {
		console.error("Error loading scene: no scene data found.");
		return;
	}
    var scene = new lime.Scene();
    var scroller = new lime.ui.Scroller().setAnchorPoint(0,0).setSize(renderContext.director.getSize());
	
//	renderContext.scene = scene;
	scene.appendChild(scroller);
	renderContext.scene = scroller;
	renderContext.scroller = scroller;
	
	renderContext.director.replaceScene(scene,lime.transitions.Dissolve,1);

	if (data.scene.hasOwnProperty('children')) {
		var sceneData = data.scene.children;
		sceneData.forEach(function(e){ renderContext.addSceneObject(e, scroller, true); });
	} else console.warn("load found no scene objects");
	
/*	renderContext.getObjects().forEach( function(e)
		{
			if (!e.behaviors) return;
			e.behaviors.forEach( function (bo) { 
				var n = bo.name;
				console.log(bo);
				bo.obj.attach(); 
			});
		}
	);*/
	renderContext.director.setPaused(false);
	renderContext.scene.dispatchEvent({type:'start'});
	renderContext.scene.dispatchEvent({type:'enterScene'}); // TODO: move this into lime.Scene		
	
}


renderContext.startGame = function( e, w, h, sceneName){
	
	this.DOMElement = e;
	var director = new lime.Director(e,w,h),
	    scene = new lime.Scene();	
    	scene.setAutoResize(lime.AutoResize.ALL);

	// set current scene active
	director.replaceScene(scene);
	renderContext.scene = scene;
	renderContext.director = director;
	
	renderContext.director.makeMobileWebAppCapable();
	
	renderContext.loadAndPlayScene(sceneName);
}

renderContext.pathGridSize = 10;

renderContext.findPath = function( start_x, start_y, end_x, end_y)
{
	width = renderContext.scene.getSize().width;
	height = renderContext.scene.getSize().height;
	
	if (renderContext.graph == undefined) {
		// build array of walls
		var array = [];
		for (var x=0; x<width; x+=renderContext.pathGridSize) {
			var row = [];
			for (var y=0; y<height; y+=renderContext.pathGridSize) {				
				var b = false;
				var coord = new goog.math.Coordinate(x,y);
				coord = renderContext.scene.screenToLocal(coord);
				renderContext.getObjects().forEach( function(e, i) { if (i!=0) b = b | e.getFrame().contains(coord); } );
				row.push( b ? 1 : 0);
			}
			array.push(row);
		}
		//console.log(array);
		renderContext.graph = new Graph(array);
	}
	
	var start = renderContext.graph.nodes[Math.floor(start_x/renderContext.pathGridSize)][Math.floor(start_y/renderContext.pathGridSize)];
	var end = renderContext.graph.nodes[Math.floor(end_x/renderContext.pathGridSize)][Math.floor(end_y/renderContext.pathGridSize)];
	var result = astar.search(renderContext.graph.nodes, start, end);
	return result;
}

renderContext.setRendererCanvas = function() 
{
	renderContext.getObjects().forEach( function(e) {e.setRenderer(lime.Renderer.CANVAS);})
}

renderContext.setRendererDOM = function() 
{
	renderContext.getObjects().forEach( function(e) {e.setRenderer(lime.Renderer.DOM);})
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode

goog.exportSymbol('renderContext.start', renderContext.start);
goog.exportSymbol('renderContext.serializeContext', renderContext.serializeContext);
goog.exportSymbol('renderContext.objectifyContext', renderContext.objectifyContext);
goog.exportSymbol('renderContext.clearScene', renderContext.clearScene);
goog.exportSymbol('renderContext.resize', renderContext.resize);
