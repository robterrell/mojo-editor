var gameViewInstance;


@import <AppKit/CPView.j>
@import "RTSelectionBox.j"


@implementation GameView : CPView
{
	RTSelectionBox selectionBox;
	CPObject appController;
	CPTableView propertyTableView;
	
	int selectedItem @accessors;
	Object selectedObject @accessors;
	Object prePlaySnapshot;

	bool playing; // note: opposite of the flag in appController

	Array selectionBoxes;
	Array selectedItems @accessors;
	
	CPObject undoData;
	
	float scale;
}

+ (GameView) sharedGameView
{
	return gameViewInstance;
}

- (id)initWithFrame:(CGRect)aRect
{
    if (self = [super initWithFrame:aRect])
    {
		var e = document.createElement("renderContext");
		self._DOMElement.style.backgroundImage = "url('Resources/Checkerboard.png')";
		e.style.backgroundColor = "transparent";
		self._DOMElement.appendChild(e);

		renderContext.start(e, 1000, 1000) ; //aRect.size.width, aRect.size.height);
		
	//	renderContext.setSize(aRect.size.width, aRect.size.height);

		setTimeout( function(){ window.resizeBy(1,1); window.resizeBy(-1,-1);}, 50);

		selectionBox = [[RTSelectionBox alloc] initWithFrame: CGRectMake(10.0, 10.0, 10.0, 10.0)];
		[self addSubview: selectionBox];
		[selectionBox setHidden: YES];

		selectedItem = -1;
		playing = NO;
		
		selectionBoxes = [];
		selectedItems = [];
		scale = 1;
    }
	gameViewInstance = self;
    return self;
}

-(void) resizeWithOldSuperviewSize:(CGSize) aSize
{
//    renderContext.setSize(aSize.size.width, aSize.size.height);
//	renderContext.setScale(scale);
}

-(void) setFrame: (CGRect) aRect
{
    [super setFrame: aRect];
    renderContext.resize(aRect.size.width, aRect.size.height);
//	renderContext.director.setScale(scale);
}

-(void) setSelectedItem: (int) childIndex
{
	// // Note: this is called from the superview, so it shouldn't call back to the super
	// var target = renderContext.getObjectAtIndex(childIndex);
	// if (target == undefined) {
	//         [selectionBox setFrame: CGRectMake(10.0, 10.0, 10.0, 10.0)];
	// 	[selectionBox setHidden: YES];		
	// 	selectedItem = -1;
	// 	return;
	// }
	// var b = target.getBoundingBox();
	// var s = renderContext.director.getScale();
	// var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
	// 
	// [selectionBox setSelectionBoxFrame: r];
	// [selectionBox setHidden: NO];
	// [selectionBox setSelectedObject: target];
	// selectedItem = childIndex;	
}

-(void) setSelectedIndexes: (CPIndexSet) indexes
{
	// Note: this is called from the superview, so it shouldn't call back to the super
	[self selectNone];
	[indexes getIndexes: selectedItems maxCount: 300 inIndexRange: 0];
	[self makeSelectionBoxes];
}

-(void) hideSelectionBoxes
{
	if (selectionBoxes) selectionBoxes.forEach( function(e,i) {
		if (e) [e setHidden: YES];
	});	
}

-(void) showSelectionBoxes
{
	if (selectionBoxes) selectionBoxes.forEach( function(e,i) {
		if (e) [e setHidden: NO];
	});	
}

-(void) makeSelectionBoxes
{
	if (selectionBoxes) {
		selectionBoxes.forEach( function(e,i) {
			if (e) [e removeFromSuperview];
		});
		selectionBoxes = [];
	}
	selectedItems.forEach( function(e,i) {
		var target = renderContext.getObjectAtIndex(e);
		if (target==undefined) return;
		var sb = [[RTSelectionBox alloc] initWithFrame: CGRectMake(10.0, 10.0, 10.0, 10.0)];
		var b = target.getBoundingBox();
		var s = {x: scale, y: scale}; //renderContext.director.getScale();
		var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
		[sb setSelectionBoxFrame: r];
		[sb setHidden: NO];
		[sb setSelectedObject: target];
		[self addSubview: sb];
		selectionBoxes.push(sb);
		[sb setNeedsDisplay: YES];
	});
	[self setNeedsDisplay: YES];	
}

-(void) updateSelectionBoxes
{
	selectionBoxes.forEach( function(e) {
		var target = e.selectedObject;
		if (target==undefined) return;
		var b = target.getBoundingBox();
//		var s = renderContext.director.getScale();
		var s = {x: scale, y: scale}; //renderContext.director.getScale();
		var r = CGRectMake(b.left*s.x, b.top*s.y, b.right*s.x-b.left*s.x, b.bottom*s.y-b.top*s.y);
		[e setSelectionBoxFrame: r];
		[e setHidden: NO];
		[e setSelectedObject: target];
		[e setNeedsDisplay: YES];		
	});
}


-(void) selectNone
{
	if (selectionBoxes) selectionBoxes.forEach( function(e,i) {
		if (e) [e removeFromSuperview];
	});
	
	selectionBoxes = [];
	selectedItems = [];
}

-(Object) addGameObject:(Object) o parent: (Object) p 
{
	var target = renderContext.addSceneObject(o,p);
	[appController reloadTables];
	return target;
}


-(Object) addGameObjectRecursively:(Object) o parent: (Object) p 
{
	[self addGameObject: o parent: p];
	if (o.children.length > 0) o.children.forEach(function(c){ [self addGameObjectRecursively: c parent: o]});
}

-(Object) removeGameObject:(Object) o
{
	renderContext.removeSceneObject(o);
	[self setSelectionEmpty];
}

-(Object) removeGameObjectAtIndex:(int) i
{	
	if (i<renderContext.getObjects().length) {
		renderContext.removeSceneObject( renderContext.getObjectAtIndex(i) );
		[self setSelectionEmpty];		
	}
}


-(void) gameContextItemClicked: (int) index
{
	if (index > -1) [appController selectGameObjectAtIndex: index];
}


-(void) setSelectionEmpty
{
	// NOTE: calls back to the appController, to unshow the properties
	// don't do anything that might cause an infinite loop
	// [selectionBox setHidden: YES];
	[appController selectGameObjectAtIndex: -1];
	selectedItem = -1;
	[self selectNone];
}

//-(void) mouseDown: (CPEvent) anEvent
//{
//	[selectionBox setHidden: YES];
//}

-(void) nudgeSelectionX:(float)x Y:(float) y
{
	[self willPerformUndoableAction];
	
	selectedItems.forEach( function(e,i) {
		//console.log("nudge object #", e);
		var b = renderContext.getObjectAtIndex(e);
		if (b == undefined) return;
		var p = b.getPosition();
		p.x += x;
		p.y += y;	
		b.setPosition(p);
	});

	[self didPerformUndoableAction];
	[self makeSelectionBoxes];
		
	// var b = renderContext.getObjectAtIndex(selectedItem);
	// if (b == undefined) return;
	// var p = b.getPosition();
	// p.x += x;
	// p.y += y;	
	// b.setPosition(p);
	// [self setSelectedItem: selectedItem];
}

-(void) acceptsFirstResponder
{
	return YES;
}

-(BOOL) acceptsFirstMouse: (CPEvent) e
{
	return YES;
}

-(void)duplicateSelectedGameObject: (id) sender
{
	if (selectedItem != -1) 
	{
		var o = renderContext.getObjectAtIndex(selectedItem).objectify();
		o.position = { x: o.position.x + 25, y: o.position.y + 25};
		[self addGameObject: o parent: renderContext.scene];
		[appController selectGameObjectAtIndex: renderContext.getObjects().length-1];
	}
	
	selectedItems.forEach( function(e,i) {
		var o = renderContext.getObjectAtIndex(e).objectify();
		o.position = { x: o.position.x + 25, y: o.position.y + 25};
		[self addGameObject: o parent: renderContext.scene];
		[appController selectGameObjectAtIndex: renderContext.getObjects().length-1];
	});
}

- (void) keyDown:(CPEvent)anEvent
{
	if (playing) return;
	
	var delta = 1;
	if ([anEvent modifierFlags] && CPAlternateKeyMask) delta = 10;
	
	switch ([anEvent keyCode]) {
		case 38: [self nudgeSelectionX: 0.0 Y: -delta]; break;
		case 37: [self nudgeSelectionX: -delta Y: 0.0]; break;
		case 39: [self nudgeSelectionX: delta Y: 0.0]; break;
		case 40: [self nudgeSelectionX: 0 Y: delta]; break;
		case CPDeleteFunctionKey:
		case CPDeleteCharFunctionKey:
		case CPDeleteLineFunctionKey: [self deleteKeyPressed]; break;
		case 100: [self duplicateSelectedGameObject: nil]; break;
		case 122: console.log("undo");[[[self window] undoManager] undo]; break;
	}
}

-(void) doScaleMenu: (id) sender
{
	var i = [[sender selectedItem] title];
	var s = parseInt(i) / 100.0;
	renderContext.director.setScale(s);
	// re-select item to resize the selection box
	if (selectedItem >= 0) [self setSelectedItem: selectedItem];
	[appController.scaleButton setTitle: i];
}

-(void) createSceneObject: (Object) o withParent: (Object) p
{
	target = [self addGameObject: o parent: p];	
	if (o.children.length > 0) o.children.forEach(function(c){ [self addGameObject: c withParent: target]});
}

-(void) willPerformUndoableAction
{
	undoData = renderContext.objectifyContext();
	console.log(undoData);
}

-(void) didPerformUndoableAction
{
	[[[self window] undoManager] registerUndoWithTarget: self selector:@selector(undoAction:) object: undoData];	
}

-(void) undoAction: (Object) p
{	
	renderContext.clearScene();
	var sceneData = p.children;
	sceneData.forEach(function(e){ [self createSceneObject: e withParent: renderContext.scene]});

	// tell the game view we loaded new data
	[self sceneWasLoaded];
	[self makeSelectionBoxes];
}

/*- (void)drawRect:(CGRect)aRect
{
    // Add drawing code here
	[super drawRect: aRect];

    var context = [[CPGraphicsContext currentContext] graphicsPort];
    CGContextSetStrokeColor(context, [CPColor blueColor]);
    CGContextStrokeRect(context, CGRectMake(0,0,1024, 768));
    CGContextStrokeRect(context, CGRectMake(0,0,768, 1024));

}*/


/*
- (void)layoutSubviews
{
    // Add layout code here
}
*/

- (void)performDragOperation:(CPDraggingInfo)aSender
{
//	console.log(CPDraggingInfo);
//	console.log([aSender draggingPasteboard]);
    var data = [[aSender draggingPasteboard] dataForType: "AssetDragType"];
	var a = [CPKeyedUnarchiver unarchiveObjectWithData:data];
	console.log("drag data:");
	console.log(a);
	
	var o = {};
	o.className = "lime.Sprite";
	if (a.hasOwnProperty('animations')) {
		o.animations = a.animations;
		o.fill = {type: 'animation', url: a.url };
	} else if (a.hasOwnProperty('frame')) {
		o.fill = {url: a.url, x: a.frame.x, y: a.frame.y, w: a.frame.w, h: a.frame.h};
	} else {
		o.fill = {url: a.url};
	}
	console.log("drag fill:");
	console.log(o.fill);
	o.position = [self convertPoint: [aSender draggingLocation] fromView: nil];
	o.size = {width: a.contentSize.width, height: a.contentSize.height};
	o.name = a.title;
	[self addGameObject: o parent: renderContext.scene];
	[appController selectGameObjectAtIndex: renderContext.getObjects().length-1];	
}

#pragma mark Play / Pause

-(void)sceneWasLoaded
{
	prePlaySnapshot = undefined;
	renderContext.scene.setOpacity(.9);
	renderContext.scene.setDirty(lime.Dirty.CONTENT);
}

- (void)playScene: (id) sender
{	
//	console.log("playScene:");
	[self setSelectionEmpty];
	renderContext.prepareToPlay();
	
	if (playing == NO) {

		// re-attach all behaviors
		renderContext.getObjects().forEach( function(e)
			{
				if (!e.behaviors) return;
//				console.log("behaviors:", e.behaviors);
				e.behaviors.forEach( function (bo) { 
					var n = bo.name;
//					var ctor = behaviorMap[s];
//					var b = new ctor(obj);
//					b.attach();
					console.log(bo);
					//console.log("attaching '",n,"' to: '",e.name,"' (",e.className,") ", JSON.stringify(bo.obj.properties));
					bo.obj.attach(); 
				});
			}
		);
		prePlaySnapshot = renderContext.serializeContext();
//		console.log("prePlaySnapshot: ", prePlaySnapshot);
		
		renderContext.scene.dispatchEvent({type:'start'});
		renderContext.scene.dispatchEvent({type:'enterScene'}); // TODO: move this into lime.Scene
	}
	playing = YES;
	renderContext.director.setPaused(NO);
	
}


- (void)pauseScene: (id) sender
{
//	console.log("pauseScene:");
	renderContext.director.setPaused(YES);
	renderContext.scene.setOpacity(.75);
}

- (void)stopScene: (id) sender
{
	if ( playing == NO ) {
		console.warn("stopScene: but not playing!");
		return;
	}
	
	// if paused, briefly unpause so we can send the exitScene and stop events
	renderContext.director.setPaused(NO);
	
	// send events to behaviors to let them end & clean up
	renderContext.scene.dispatchEvent({type:'exitScene'});
	renderContext.scene.dispatchEvent({type:'stop'});

	// detach all behaviors
	renderContext.getObjects().forEach( function(e)
		{
			if (!e.behaviors) return;
			e.behaviors.forEach( function (bo) { bo.obj.detach(); })
		}
	);

	playing = NO;

	// restore scene to its initial state
	if (prePlaySnapshot) {
		renderContext.clearScene();
		var sceneData = JSON.parse(prePlaySnapshot).children;
//		console.log(sceneData);
		sceneData.forEach( function(e){ [self addGameObjectRecursively: e parent: renderContext.scene]} );
	} else {
		console.warn("stopScene: there was no prePlaySnapshot");
	}

	renderContext.prepareToEdit();
	[self setSelectionEmpty];
	
}


-(void) dragSelectedObjectsWithX: (int) x andY: (int) y sourceObject: (CPObject) src
{	
	if (selectedItems.length <= 1) return;
	var unionRect = CGRectMake(0,0,0,0);
	selectionBoxes.forEach( function(e,i) {
		if (e === src) return;
		//console.log("sharing drag with", e);
		[e groupDragWithX: x andY: y];
		unionRect = CGRectUnion(unionRect, [e bounds]);
	});	
	//console.log("union rect", unionRect);
}

- (void)mouseDown: (CPEvent) e
{
	if ( playing ) return;

	var p = [e globalLocation];
	var p2 = new goog.math.Coordinate(p.x, p.y);
	var be = { screenPosition: p2 };
	var found = NO;
	
	var all = renderContext.getObjects();
	for (i=all.length-1; i>=0; i--)
	{
		if (renderContext.getObjectAtIndex(i).hitTest(be)) {
			found = YES;
			[appController selectGameObjectAtIndex: i];
			break;
		}
	}
	if (! found) /*[self setSelectionEmpty];*/ [self selectNone];
}

// -(void) drawRect: (CGRect) r
// {
// 	[super drawRect: r];
// 	renderContext.scene.update();
// }

function makeGoogleCoord(x,y)
{
	return new goog.math.Coordinate(x, y);
}

@end
