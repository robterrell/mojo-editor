/*
 * AppController.j
 * Mojo
 *
 * Created by Rob Terrell on February 8, 2011.
 * Copyright 2011 Rob Terrell. All rights reserved.
 */

@import <Foundation/CPObject.j>
@import "AssetBrowser/MediaKit.j"
@import "ACEEditorView.j"
@import "RTSceneOpener.j"
@import <GrowlCappuccino/GrowlCappuccino.j>

var paused = NO;
var selectionProps = {};
var selectedItem = -1;
var appController;

var currentUser = { name: "rob" };

var AssetDragType = "AssetDragType";
var prefabs = window.prefabs | {}; 

/* Pusher
 * Mojo Editor
 * This class performs a ChouchDB push and gives a growl-like notification
 */ 
 
@implementation Pusher : CPObject
{
	var data;
}

-(void)connection:(CPURLConnection)aConnection didReceiveData:(CPString)_data
{
	data = JSON.parse(_data);
}

-(void)connectionDidFinishLoading:(CPURLConnection)connection
{
	var t;
	if (data.no_changes == true) t = "No changes";
	else t = "Changes: " + data.history[0].docs_read;
	
	[[CPNotificationCenter defaultCenter] postNotificationName:"showNotificationString" object: connection.completionText + "\r" + t];
}
@end


@implementation AppController : CPObject
{
    @outlet CPWindow    theWindow; //this "outlet" is connected automatically by the Cib
    @outlet CPTextField status;
    @outlet CPButton  playPause;
    @outlet CPView gameView;
    @outlet CPButton stopButton;
    @outlet CPPopUpButton createPopup;
    @outlet CPCheckBox showFPS;
    @outlet CPView topbarView;
    @outlet CPTableView tableView;

    @outlet CPWindow chatWindow;
    @outlet CPTextField chatOutput;
    @outlet CPTextField chatInput; 
    @outlet CPButton chatSend;

    @outlet CPScrollView scrollView;
    @outlet CPColorWell colorWell;

    @outlet CPTableView propertyTable;
	@outlet CPScrollView propertyScrollView;
	
	Object openDocument;
	CPString docName;
	@outlet CPTextField docNameField;
	
	@outlet CPOutlineView sceneOutline;
	
	@outlet CPWindow docInfoPanel;
	@outlet CPString doc_revision;
	@outlet CPString doc_id;
	@outlet CPString doc_updated;
	@outlet CPString doc_user;
	
	@outlet CPOutlineView behaviorTable;
	@outlet CPScrollView behaviorScrollView;

	@outlet UploadButton uploadButton;
	CPPopUpButton scaleButton;
	
	@outlet CPButtonBar objectsBar;
	@outlet CPButtonBar gameViewBar;
	@outlet CPButtonBar behaviorsBar;
		
	Object connectionData;
	
	@outlet CPWindow scriptWindow;
	@outlet ACEEditorView scriptView;
	@outlet CPPopUpButton scriptRevisionsButton;
		
	@outlet RTSceneOpener sceneOpener;
	
	@outlet CPWindow uploadWindow;
}

#pragma mark Startup

- (void)awakeFromCib
{
}

+ (AppController) sharedInstance
{
	return appController; 
}

-(void) showNotificationTitle: (CPString) title message: (CPString) msg
{
	console.log(msg+": "+title);
	var growl = [TNGrowlCenter defaultCenter];
	[growl setView: [theWindow contentView]];
	[growl pushNotificationWithTitle: title message: msg];	
}

-(void) showNotification: (CPNotification)aNotification
{
	var o = [aNotification object];
	var msg, title = "Note";
	if (o.msg) msg = o.msg;
	if (o.title) title = o.title;
	
	var growl = [TNGrowlCenter defaultCenter];
	[growl setView: [theWindow contentView]];
	[growl pushNotificationWithTitle: title message: msg];
}

-(void) showNotificationString: (CPNotification)aNotification
{
	var o = [aNotification object];
	
	var growl = [TNGrowlCenter defaultCenter];
	[growl setView: [theWindow contentView]];
	[growl pushNotificationWithTitle: @"Info" message: o];
}

-(void) applicationWillTerminate: (CPNotification) notif
{
	if (window.localStorage) {
		var scene = renderContext.objectifyContext();
		
		var od = {};
		od.scene = scene;
		od.type = "scene";
		od.updated = JSON.stringify(new Date());
		od.updated_by = currentUser.name;
		od._rev = openDocument._rev;
		od._id = openDocument._id;
		
		window.localStorage.setItem("lastLoadedDocument", JSON.stringify(od));
	}
}

- (void)applicationDidFinishLaunching:(CPNotification)aNotification
{
	scaleButton = [[CPPopUpButton alloc] initWithFrame: CGRectOffset([stopButton frame], [stopButton frame].size.width + 60, 0) pullsDown:YES];
	[scaleButton setAutoresizingMask: 4];
    [scaleButton setTitle:@"100%"];
    [scaleButton setTarget: gameView];
    [scaleButton setAction: @selector(doScaleMenu:)];
    [scaleButton addItemWithTitle: @"50%"];
    [scaleButton addItemWithTitle: @"75%"];
    [scaleButton addItemWithTitle: @"100%"];
    [scaleButton addItemWithTitle: @"150%"];
    [scaleButton addItemWithTitle: @"200%"];
    [scaleButton addItemWithTitle: @"300%"];
    [scaleButton addItemWithTitle: @"400%"];
    [scaleButton sizeToFit];
    [topbarView addSubview:scaleButton];

	// create the CPTableView
    tableView = [[CPTableView alloc] initWithFrame:[scrollView bounds]];

   [tableView setDataSource:self];
   [tableView setAction: @selector(tableViewSelected:)];
   [tableView setUsesAlternatingRowBackgroundColors:YES];
 	[[tableView cornerView] setBackgroundColor: [CPColor alternateSelectedControlColor]];
 	[tableView setAllowsMultipleSelection: YES];

	
    // add the first column
    var column = [[CPTableColumn alloc] initWithIdentifier:@"Name"];
    [[column headerView] setStringValue:"Name"];
    [column setWidth: 110];
    [tableView addTableColumn:column];

    var column2 = [[CPTableColumn alloc] initWithIdentifier:@"Type"];
    [[column2 headerView] setStringValue:"Type"];
    [column2 setWidth: 140];
    [tableView addTableColumn:column2];

 	[scrollView setDocumentView: tableView];

    [chatInput setEditable: YES];
    [chatOutput setEditable: NO];
    [chatInput setDelegate: self];

    [colorWell setAction: @selector(colorWellDone:)];
    [colorWell setTarget: self];

	// Property Table
 	propertyTable = [[CPTableView alloc] initWithFrame:[propertyTable bounds]];	
	[propertyTable setDataSource:self];
	[propertyTable setUsesAlternatingRowBackgroundColors:YES];

	// add the columns
	var p1 = [[CPTableColumn alloc] initWithIdentifier:@"Property"];
	[[p1 headerView] setStringValue:"Property"];
	[p1 setWidth: 85];
	[propertyTable addTableColumn:p1];

	var p2 = [[CPTableColumn alloc] initWithIdentifier:@"Value"];
	[[p2 headerView] setStringValue:"Value"];
	[p2 setWidth: 165];
	[p2 setEditable: YES];
	[propertyTable addTableColumn:p2];

    [propertyScrollView setDocumentView: propertyTable];

	// behavior table	
	behaviorTable = [[CPOutlineView alloc] initWithFrame:[behaviorScrollView bounds]];
	[behaviorTable setDataSource: self];
	[behaviorTable setDelegate: self];
//  [behaviorTable setAction: @selector(behaviorSelected:)];
    [behaviorTable setUsesAlternatingRowBackgroundColors:YES];
	
	// add the first column
	var c3 = [[CPTableColumn alloc] initWithIdentifier:@"Behavior"];
	[[c3 headerView] setStringValue:"Behavior"];
	[c3 setWidth: 165];
	[behaviorTable addTableColumn:c3];
	// add the second column
	var c4 = [[CPTableColumn alloc] initWithIdentifier:@"Value"];
	[[c4 headerView] setStringValue:"Value"];
	[c4 setWidth: 85];
	[c4 setEditable: YES];
	[behaviorTable addTableColumn:c4];	

	// for outline disclosure triangles
	[behaviorTable setOutlineTableColumn: c3];
	
	[behaviorScrollView setDocumentView: behaviorTable];
	

	// Upload button
	// var u = [[UploadButton alloc] initWithFrame: [uploadButton frame]];
	// u.autoResizingMask = uploadButton.autoResizingMask;
	//     [u allowsMultipleFiles:YES];
	//     [u setURL: serverInfo.baseUrl + "/" + serverInfo.databaseName];
	//     [u setDelegate:self];
	// [uploadButton removeFromSuperview];
	// [topbarView addSubview: u];
	// [u setValue: @"asset" forParameter: @"type"];
	// [u setValue: currentUser.name forParameter: @"created_by"];
	//  	uploadButton = u;
	// [uploadButton setAction: @selector(doUpload:)];

	// Scene list button bar
	var minus = [CPButtonBar minusButton];
	var add = [CPButtonBar actionPopupButton];
	[add setAction: @selector(doCreateMenu:)];
	[minus setAction: @selector(doDeleteSceneObject:)];
	
	var primitives = renderContext.getPrimitives();
	primitives.forEach( function(e) {
		[add addItemWithTitle: e.name];
	});

	[add addItem: [CPMenuItem separatorItem]];

	// Non-primitive Prefabs are loaded into window.prefabs by a JavaScript that runs before this point 
	
	if (window.prefabs) {
		var prefabNames = Object.keys(window.prefabs);
		var groups = {}, menus = [];
		prefabNames.forEach( function(e) { 
			if (window.prefabs[e].path != '') {
				var path = window.prefabs[e].path;
				if (groups.hasOwnProperty(path)) {
					var m = groups[path];
					[m addItem: [[CPMenuItem alloc] initWithTitle: e action: @selector(doCreateMenu:) keyEquivalent: null]];
				} else {
					var m = [[CPMenu alloc] initWithTitle: path];
					groups[path] = m;
					[m addItem: [[CPMenuItem alloc] initWithTitle: e action: @selector(doCreateMenu:) keyEquivalent: null]];
					[add addItemWithTitle: path];
					[[add itemWithTitle: path] setSubmenu: m];
				}
			} else {
				[add addItemWithTitle: e]; 
			}
		});
	}
	
	[objectsBar setButtons: [add, minus]];

	var minus1 = [CPButtonBar minusButton];
	var add1 = [CPButtonBar actionPopupButton];
	var editScript = [CPButtonBar actionPopupButton];
	[add1 setAction: @selector(doAddBehavior:)];
	[minus1 setAction: @selector(doRemoveBehavior:)];
	
	// edit button
	var editButton = [[CPButton alloc] initWithFrame:CGRectMake(0, 0, 50, 25)];
	[editButton setBordered:NO];
	[editButton setTitle:@"Edit"];
	[editButton setAction: @selector(doEditBehavior:)];
	
	[behaviorsBar setButtons: [add1, minus1, editButton]];
	
	[colorWell setHidden: YES];

	gameView.appController = self;	
	renderContext.gameView = gameView;
	appController = self;
	
	[theWindow makeKeyWindow];
	[theWindow makeFirstResponder: gameView];

	// load the behaviors into a global object
	behaviorMap = {}; 
	var keys = Object.keys(mojo.behavior)
	for (var i=0; i<keys.length; i++) {
		var name = keys[i];
		if (name != "base") {
			[add1 addItemWithTitle: @""+name];
			behaviorMap[name] = mojo.behavior[name];			
		}
	};

	
	// set up drag and drop
	[gameView registerForDraggedTypes:[AssetDragType]];
	[tableView registerForDraggedTypes:[AssetDragType, "SceneListDragType"]];
	[tableView setVerticalMotionCanBeginDrag: YES];
		
	// Script Editor window
	[scriptView setThemeName: @"theme-twilight"];
	[scriptView setModeName: @"mode-javascript"];

	// editor begins with scene paused, not playing
	paused = YES;
	
	[[CPNotificationCenter defaultCenter] addObserver:self selector:@selector(showNotification:) name: "showNotification" object: nil];
    
	[[CPNotificationCenter defaultCenter] addObserver:self selector:@selector(showNotificationString:) name: "showNotificationString" object: nil];

	if (window.localStorage) {
		console.log("attempting to load last loaded scene");
		var od = window.localStorage.lastLoadedDocument;
		if (od) {
			var d = JSON.parse(od);
			[self dataLoaded: d];
		}
		
	}


}

#pragma mark Actions

-(@action) playPause: (id) sender
{
    paused = ! paused;
    if (paused) {
		[playPause setTitle: @"▶"];   // play =  \u25b6
		[gameView pauseScene: nil];
	}
    else {
		[playPause setTitle: '"'];
		[gameView playScene: nil];
	}
}

-(@action) stop: (id) sender
{
    // todo: make this do more than just pause
    paused = YES;
    [playPause setTitle: @"▶"];   // play =  \u25b6
    [gameView stopScene: nil]
}

-(@action) toggleFPS: (id) sender
{
	console.log("toggleFPS");
    renderContext.director.setDisplayFPS( ! renderContext.director.isDisplayFPS());
}


-(bool)becomesFirstResponder
{
	return NO;
}

-(@action) doPush: (id) sender
{

	[self pushUp: nil];
	[self pullDown: nil];
	
}

-(@action) pushUp: (id) sender
{
	
    var request = [CPURLRequest requestWithURL: "http://127.0.0.1:5984/_replicate"];
	var o = {"source": "dragons_scenes", "target": [[RTCouchServer sharedCouchServer] remoteServerAndDatabase] };
	var d = [[Pusher alloc] init];
	[request setHTTPMethod:"POST"];
    [request setValue:"application/json" forHTTPHeaderField:"Accept"];
    [request setValue:"application/json" forHTTPHeaderField:"Content-Type"];
	[request setHTTPBody: [CPString JSONFromObject: o]];
	var connection  = [CPURLConnection connectionWithRequest:request delegate:d];				
	connection.completionText = "Finished upstream replication";
	
	var p = [[CPObject alloc] init];
	p.msg = @"Replicating to " + o.target;
	p.title = "Sync";
	[[CPNotificationCenter defaultCenter] postNotificationName: @"showNotification" object: p];
	
}

-(@action) pullDown: (id) sender
{
	
    var request = [CPURLRequest requestWithURL: "http://127.0.0.1:5984/_replicate"];
	var o = {"target": "dragons_scenes", "source": [[RTCouchServer sharedCouchServer] remoteServerAndDatabase] };
	var d = [[Pusher alloc] init];
	[request setHTTPMethod:"POST"];
    [request setValue:"application/json" forHTTPHeaderField:"Accept"];
    [request setValue:"application/json" forHTTPHeaderField:"Content-Type"];
    [request setHTTPBody: [CPString JSONFromObject: o]];
	var connection  = [CPURLConnection connectionWithRequest:request delegate: d];
	connection.completionText = "Finished downstream replication";
	var p = [[CPObject alloc] init];
	p.msg = @"Started replication from "+o.source;
	p.title = "Sync";
	[[CPNotificationCenter defaultCenter] postNotificationName: @"showNotification" object: p];
	
}



-(@action) showAssetWindow: (id) sender
{
	[[MKMediaPanel sharedMediaPanel] orderFront:self];
}

-(@action) showChat: (id) sender
{
    [chatWindow makeKeyAndOrderFront: nil];
}

-(@action) chatSend: (id) sender
{
    if (now) {
        console.log("chatSend: " + [chatInput objectValue]);
        now.distributeMessage([chatInput objectValue]);
    }
    [chatInput setStringValue: @""];
}

-(void) controlTextDidChange: (id) sender
{
    [self chatSend: nil];
}


-(void) doCreateMenu: (id) sender
{
	var s;
	if ([sender respondsToSelector: @selector(selectedItem)]) {
		s = [[sender selectedItem] title];
	} else {
		s = [sender title];
	}
	
    // console.log(s);
    var target;
	var o;
	if (window.prefabs[s] != nil) {
		o = {}; goog.object.extend(o, window.prefabs[s]);
	} else  switch (s) {
        case "Button": o = { className: "2D.Button", size: {width: 150, height: 40}, position: {x: 200, y:200}, anchorPoint: {x:.5, y:.5}, fill: "rgb(200,150,0)"}; break;
        case "Circle": o = { className: "2D.Circle", size: {width: 150, height: 150}, position: {x: 200, y:200}, fill: "rgb(0,150,250)", anchorPoint: {x:.5, y:.5}}; break;
        case "Label": o = { className: "2D.Label", text: "Mojo!", font: "Helvetica", fontSize: 24, size: {width: 150, height: 40}, position: {x: 200, y:200}, fontWeight: 400, anchorPoint: {x:.5, y:.5}}; break;
        case "Rounded Rect":  o = { className: "2D.RoundedRect", size: {width: 150, height: 150}, position: {x: 200, y:200}, fill: "rgb(0,199,199)"}; break;
        case "Sprite":  o = { className: "2D.Sprite", size: {width: 160, height: 160}, position: {x: 200, y:200}, fill: "./Resources/Hammer_Spanner.png"}; break;
        case "Rectangle":  o = { className: "2D.Sprite", size: {width: 160, height: 160}, position: {x: 200, y:200}, fill: "rgb(150,200,0)", anchorPoint: {x:.5, y:.5}}; break;
        case "Empty GameObject":  o = { className: "2D.Sprite", size: {width: 160, height: 160}, position: {x: 200, y:200}}; break;

    }
    if (o) {
		o.children = [];
		target = [self createSceneObject: o withParent: renderContext.scene];
	}
    [tableView reloadData];

}

-(void) doDeleteSceneObject: (id) sender
{
	console.log("doDelete");
	if (selectedItem>-1) {
		var n = selectedItem - 1;
		[gameView removeGameObjectAtIndex: selectedItem];
		// [gameView setSelectedItem: selectedItem-1];
		// [self tableViewSelected: nil];
		
		[self selectGameObjectAtIndex: n];
	}
}

-(void) doAddBehavior: (id) sender
{
	var i = [tableView selectedRow];
    if (i<0) return;
	var s = [[sender selectedItem] title];
	
	gameView.selectedItems.forEach( function(e,i) {
		var obj = renderContext.getObjectAtIndex(e);
		console.log("doAddBehavior ",s,e);
		if (Object.keys(behaviorMap).indexOf(s) == -1) {  [self showNotificationTitle: @"Error" message: "Missing behavior: " + s]; }
		var ctor = behaviorMap[s];
		var b = new ctor(obj);
		if (obj.behaviors == undefined) obj.behaviors = [];
		var o = {"name": s, "obj": b};
		obj.behaviors.push(o);		
	});
	
	if (gameView.selectedItems.length == 1) [self selectGameObjectAtIndex: i];
}

-(void) doRemoveBehavior: (id) sender
{	
	var row = [behaviorTable selectedRow];
    if (item<0) return;
	var item = [behaviorTable itemAtRow: row];
	if (typeof(item)=="string") {
		var behaviors = renderContext.getObjectAtIndex(selectedItem).behaviors; // array of behaviors
		var index = behaviors.map(function(e){return e.name}).indexOf(item);
		if (index > -1) {
			behaviors.splice(index,1);
		}
	}
	[self selectGameObjectAtIndex: selectedItem];
}

-(void) doEditBehavior: (id) sender
{
	[scriptWindow makeKeyAndOrderFront: self];	
	[scriptView setContentText: "function() { \r\tconsole.log('test');\r };"];
}
-(void) selectGameObjectAtIndex: (int) index
{
//	console.log("selectGameObjectAtIndex");
	[tableView selectRowIndexes: [CPIndexSet indexSetWithIndex: index] byExtendingSelection: NO];
	[self tableViewSelected: index];
}

#pragma mark Script Editing

-(@action) saveScript: (id) sender
{
	console.log("save script");
}

-(@action) showScriptRevision: (id) sender
{
	console.log("show script revision");
}

#pragma mark Table views

- (void)performDragOperation:(CPDraggingInfo)aSender
{
	console.log("performDragOperation");
    var data = [[aSender draggingPasteboard] dataForType: "SceneListDragType"];
	console.log(data);
}

- (BOOL)tableView:(CPTableView)aTableView writeRowsWithIndexes:(CPIndexSet)rowIndexes toPasteboard:(CPPasteboard)pboard
{
    var data = [CPKeyedArchiver archivedDataWithRootObject: rowIndexes];
    [pboard declareTypes:["SceneListDragType"] owner:self];
    [pboard setData:data forType:"SceneListDragType"];
	return YES;
}

- (CPDragOperation)tableView:(CPTableView)aTableView validateDrop:(CPDraggingInfo)info proposedRow:(int)row proposedDropOperation:(CPTableViewDropOperation)operation;
{
	return CPDragOperationMove;
}

-(BOOL)tableView:(CPTableView)aTableView acceptDrop:(CPDraggingInfo)info row:(int)row dropOperation:(CPTableViewDropOperation)operation;
{
	var data = [[info draggingPasteboard] dataForType: "SceneListDragType"];
	var a = [CPKeyedUnarchiver unarchiveObjectWithData:data];
	var fromRow = [a firstIndex];
	console.log("fromRow: " + fromRow + " to row: " + row);
	
	renderContext.scene.setChildIndex(renderContext.getObjectAtIndex(fromRow), row);
	[aTableView reloadData];
}

-(@action) tableViewSelected: (id) sender
{
    var i = [tableView selectedRow];
	console.log("tableViewSelected row:", i);
	if (i<0) { 
		selectedItem = -1; 
		selectionProps = {};
		[tableView reloadData];
		[propertyTable reloadData];	
		[behaviorTable reloadData];	
		[gameView setSelectedItem: -1];
		[gameView selectNone];
		[colorWell setHidden: YES];
		return;
	}
	if (i < renderContext.getObjects().length) {
		selectedItem = i;
		selectionProps = renderContext.getObjectAtIndex(i).objectify();
		var fill;
		if (renderContext.getObjectAtIndex(i).getFill) fill = renderContext.getObjectAtIndex(i).getFill();
		if (fill) {
			[colorWell setHidden: NO];
			if (fill instanceof lime.fill.Color) [colorWell setColor: [CPColor colorWithCSSString: fill.str]];
		}
		// if (renderContext.getObjectAtIndex(i).className == "2D.Label") {
		// 	[colorWell setHidden: NO];
		// 	[colorWell setColor: [CPColor colorWithCSSString: renderContext.getObjectAtIndex(i).getFontColor() ]];
		// }
		[gameView setSelectedItem: i];
		[tableView reloadData];
		[propertyTable reloadData];	
		[behaviorTable reloadData];	
		[behaviorTable expandItem: nil expandChildren: YES];
		[theWindow makeFirstResponder: gameView];
	}
	var si = [tableView selectedRowIndexes];
	[gameView setSelectedIndexes: si];
		
//	console.log("tableViewSelected done");
}

-(@action) behaviorSelected: (id) sender
{
	console.log("behaviorSelected");
}

-(@action) colorWellDone: (id) sender
{
    var c = [[colorWell color] cssString];
	//console.log(c);
    var i = [tableView selectedRow];
    if (i < renderContext.getObjects().length) {
		//console.log(c);
		var o = renderContext.getObjectAtIndex(i);
		if (o.className == "2D.Label") o.setFontColot(c);
		else o.setFill(c);
	} else console.log("can't set color on item " + i);
}

-(int) numberOfRowsInTableView: (CPTableView) t
{
	switch (t) {
		case tableView: return renderContext.getObjects().length;
		case propertyTable: return Object.keys(selectionProps).length;
		case behaviorTable: if (selectionProps.behaviors) console.log("behavior table rows; " + selectionProps.behaviors.length); return selectionProps.behaviors ? selectionProps.behaviors.length : 0; //Object.keys(selectionProps.behaviors).length;
	}
	return 0;
}

- (id)tableView:(CPTableView)t objectValueForTableColumn:(CPTableColumn)tableColumn row:(int)row
{
	if (t == tableView){
		if ([[tableColumn identifier] isEqualToString: @"Name"]) return @"" + renderContext.getObjectAtIndex(row).name || @"none";
		else return @"" + renderContext.getObjectAtIndex(row).className;
	} else if (t == propertyTable) {
		var keys = Object.keys(selectionProps);
		if ([[tableColumn identifier] isEqualToString: @"Property"]) return @"" + keys[row];
		else {
			// if (keys[row] == "fontColor") {
			// 	var r = [t frameOfDataViewAtColumn: 1 row: row];
			// 	[t addSubview: colorWell];
			// 	[colorWell setFrame: CGRectOffset(CGRectInset(r,20,0), -20,0)];
			// 	[colorWell setHidden: NO];
			// 	[colorWell setColor: [CPColor colorWithCSSString: selectionProps.fontColor]];
			// 	return ""; 
			// }
			if (keys[row] == "fill") {
				[colorWell setHidden: YES];
				if (selectionProps.hasOwnProperty('fill')) {
					if (selectionProps.fill.hasOwnProperty('url_')) return @""+selectionProps.fill.url_;
					else if (selectionProps.fill.hasOwnProperty('url')) return @""+selectionProps.fill.url;
					else {
						var r = [t frameOfDataViewAtColumn: 1 row: row];
						[t addSubview: colorWell];
						[colorWell setFrame: CGRectOffset(CGRectInset(r,20,0), -20,0)];
						[colorWell setHidden: NO];
						// console.log(selectionProps.fill);
						[colorWell setColor: [CPColor colorWithCSSString: selectionProps.fill.str]];
						return ""; selectionProps[keys[row]].str;
					}
				}
			} 
			if (keys[row] == "position") {
				// TODO: change to a more generic implementation so 3D works too
				return "("+selectionProps.position.x + ", "+selectionProps.position.y+")";
			} 
			if (keys[row] == "scale") {
				// TODO: change to a more generic implementation so 3D works too
				return "("+selectionProps.scale.x + ", "+selectionProps.scale.y+")";
			} 
			if (keys[row] == "anchorPoint") {
				// TODO: change to a more generic implementation so 3D works too
				return "("+selectionProps.anchorPoint.x + ", "+selectionProps.anchorPoint.y+")";
			} 
			if (keys[row] == "size") {
				// TODO: change to a more generic implementation so 3D works too
				return "("+selectionProps.size.width + ", "+selectionProps.size.height+")";
			} 
			if (keys[row] == "children") {
				return selectionProps.children.length;
			} 
			if (keys[row] == "behaviors") {
				return selectionProps.behaviors.length;
			} 
			return @"" + selectionProps[keys[row]];
		}
	} else if (t == behaviorTable) {
		//if ([[tableColumn identifier] isEqualToString: @"Behavior"]) return @"Behavior temp " + row;
		//if ([[tableColumn identifier] isEqualToString: @"RunAt"]) return row ? @"Server" : @"Client";
		var tb = selectionProps.behaviors[row];
		if ([[tableColumn identifier] isEqualToString: @"Behavior"]) return tb.name;
		else return JSON.stringify(tb.properties);
	}
}

#pragma mark Outline View

- (id)outlineView:(CPOutlineView)outlineView child:(int)index ofItem:(id)item
{
	
	if (outlineView == tableView) {
		
		return;
	}
//	console.log("child: " + index + " OfItem: " + item);
	
	// if nothing is selected, table is empty
	if ( ! selectionProps.behaviors ) return nil;
	
	// if item is nil, return the root level (behavior names)
	if (item == nil) {
		return selectionProps.behaviors[index].name;
	} else {
		// item = be the name (string) of the behavior
		// find the behavior by its name
		var bindex = selectionProps.behaviors.map(function(e) {return e.name;}).indexOf(item);
		if (bindex == -1) return nil;
		
		var behavior = selectionProps.behaviors[bindex];
		if (behavior == undefined) {
			//console.log("behavior at index " + index + " is undefined");
			//console.log(selectionProps);
			return @"Missing";
		}
		var key = Object.keys(behavior.properties)[index];
		var value = behavior.properties[key];
//		console.log("key: " + key);
//		console.log("value: " + value);
		
		if ( goog.isObject(value) && goog.array.equals(Object.keys(value), ["x","y"]) ) {
			// this is generally a vector
			value = "("+ value.x + ", "+value.y+")";			
		}
		// // TODO: remove these special case things
		// 
		// if (key == "centerOfMass") { 
		// 	value = "("+ value.x + ", "+value.y+")";
		// } 
		// if (key == "scale") { 
		// 	value = "("+ value.x + ", "+value.y+")";
		// } 
		return [CPDictionary dictionaryWithJSObject: {"name": key, "value": value, "behavior": item}];
	}
}

- (BOOL)outlineView:(CPOutlineView)outlineView isItemExpandable:(id)item
{
	// top-level items are expandable if they have properties
	if (item == nil) return NO;
	if (typeof(item)=="string") return YES;
	return NO;
}

- (int)outlineView:(CPOutlineView)outlineView numberOfChildrenOfItem:(id)item
{
	// root level, how many behaviors?
	if (item == nil) return (selectionProps.behaviors) ? selectionProps.behaviors.length : 0;

	// if item is an object, there are no children
	if (typeof(item)=="object") return 0;

	if ( ! selectionProps.behaviors ) return 0;
	
	// if item is a string, get the number of properties
	var index = selectionProps.behaviors.map(function(e) {return e.name;}).indexOf(item);
	if (index == -1) return 0;

	var count = Object.keys(selectionProps.behaviors[index].properties).length;
	return count;
}

- (id)outlineView:(CPOutlineView)outlineView objectValueForTableColumn:(CPTableColumn)tableColumn byItem:(id)item
{
	if (typeof(item)=="string") return ([[tableColumn identifier] isEqualToString: @"Behavior"]) ? item : @"";
	return ([[tableColumn identifier] isEqualToString: @"Behavior"]) ? [item objectForKey:"name"] : [item objectForKey:"value"];
}

-(void)outlineView:(CPOutlineView)outlineView setObjectValue: (CPControl)object forTableColumn:(CPTableColumn)tableColumn byItem:(id)item
{
	console.log(object);
	console.log(item);
	
	var newValue = parseFloat(object);
	var bname = [item objectForKey: @"behavior"];
	var propName = [item objectForKey: @"name"];
	
	var bindex = selectionProps.behaviors.map(function(e) {return e.name;}).indexOf(bname);
	if (bindex == -1)  {
		console.log("index of behavior " +  + " is -1");
		return;
	}
	
	var behavior = selectionProps.behaviors[bindex];
	if (behavior == undefined) {
		console.log("behavior at index " + bindex + " is undefined");		
		return;
	}

	// if (propName == "centerOfMass") {
	// 	var a = object.split(",");
	// 	newValue = { x: a[0], y: a[1] };
	// } else if (propName == "scale") {
	// 	var a = object.split(",");
	// 	newValue = { x: a[0], y: a[1] };
	// } else 
	
	// if the current property is an object, this should probably be parsed into a vector
	if ( goog.isObject(renderContext.getObjectAtIndex(selectedItem).behaviors[bindex].obj.properties[propName]) ) 
	{
		// assuming an x,y vector
		var a = object.split(",");
		newValue = { x: a[0], y: a[1] };
	} else {
		newValue = object;
	}

//	var isString = typeof(renderContext.getObjectAtIndex(selectedItem).behaviors[bindex].obj.properties[propName])=="string";
	
	
	// if (typeof(renderContext.getObjectAtIndex(selectedItem).behaviors[bindex].obj.properties[propName])=="string")
	//  	renderContext.getObjectAtIndex(selectedItem).behaviors[bindex].obj.properties[propName] = object;
	// else
	// 	renderContext.getObjectAtIndex(selectedItem).behaviors[bindex].obj.properties[propName] = newValue;
	
	gameView.selectedItems.forEach( function(e,i) {
		console.log("set property "+propName+" to value "+object+" (old value is "+renderContext.getObjectAtIndex(e).behaviors[bindex].obj.properties[propName]+")");
		renderContext.getObjectAtIndex(e).behaviors[bindex].obj.properties[propName] = newValue;
	});

}

- (BOOL)outlineView:(CPOutlineView)outlineView shouldEditTableColumn:(CPTableColumn)aTableColumn item:(id)item
{
//	console.log("shouldEditTableColumn outline");
	if (typeof(item)=="string") return NO;
	return YES;
}


#pragma mark Table View


- (BOOL)tableView:(CPTableView)aTableView shouldEditTableColumn:(CPTableColumn)aTableColumn row:(int)anRow
{
	console.log("shouldEditTableColumn");
    return (row == 1);
}

- (void)tableView:(NSTableView *)aTableView setObjectValue:(id)anObject
   forTableColumn:(NSTableColumn *)aTableColumn row:(int)rowIndex
{
//    console.log(anObject);
	if (aTableView == propertyTable) {
		var keys = Object.keys(selectionProps);
		var key = keys[rowIndex];
		if (key == "size") {
			// size parser requires a starting parenthesis
			var s = anObject;
			if (s.indexOf("(") != 0) s = "("+s;
			if (s.indexOf(" ") != 0) {
				var a = s.split(" ");
				s = a[0] + "," + a[1];
			}
			var sz = CPSizeFromString(s);
			renderContext.getObjectAtIndex(selectedItem).setSize(sz.width, sz.height);
		}
		if (key == "scale") {
			var s = anObject;
			if (s.indexOf("(") != 0) s = "("+s;
			var sz = CPSizeFromString(s);
			renderContext.getObjectAtIndex(selectedItem).setScale(sz.width, sz.height);
		} 
		if (key == "position") {
			var s = anObject;
			if (s.indexOf("(") != 0) s = "("+s;
			var sz = CPSizeFromString(s);
			renderContext.getObjectAtIndex(selectedItem).setPosition(sz.width, sz.height);
		} 
		if (key == "anchorPoint") {
			var s = anObject;
			if (s.indexOf("(") != 0) s = "("+s;
			var sz = CPSizeFromString(s);
			renderContext.getObjectAtIndex(selectedItem).setAnchorPoint(sz.width, sz.height);
		} 
		if (key == "rotation") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setRotation(parseFloat(s));
		} 
		if (key == "text") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setText(s);
		} 
		if (key == "fontFamily") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setFontFamily(s);
		} 
		if (key == "fontColor") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setFontColor(s);
		} 
		if (key == "fontWeight") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setFontWeight(s);
		} 
		if (key == "fontSize") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setFontSize(parseFloat(s));
		} 
		if (key == "fontAlign") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setAlign(s);
		} 
		if (key == "opacity") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).setOpacity(parseFloat(s));
		} 
		if (key == "name") {
			renderContext.getObjectAtIndex(selectedItem).name = anObject;
		} 
		if (key == "fill") {
			var s = anObject;
			console.log("setting fill to", s);
			renderContext.getObjectAtIndex(selectedItem).setFill( new lime.fill.Image( s ) );
		} 
		if (key == "entityID") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).entityID = s;
		} 
		if (key == "isColored") {
			var s = anObject;
			renderContext.getObjectAtIndex(selectedItem).isColored = s;
		} 
	//	[tableView reloadData];
	//	[aTableView reloadData];
	//	[gameView setSelectedItem: selectedItem];
		[self tableViewSelected: nil];
	}
	
}

#pragma mark -

-(@action) newDocument: (id) sender
{
	if ( (openDocument != undefined) || (renderContext.getObjects().length > 0) ) {
		var ok = confirm("Discard changes?");
		if (!ok) return;
	}
	openDocument = undefined;
	[theWindow setTitle: "New Scene"];
	renderContext.clearScene();
	[gameView setSelectionEmpty];
	[self tableViewSelected: nil];
	
	window.document.title = "Mojo Editor: New Scene";
	[docNameField setStringValue: "New Scene"];
	
	// tell the game view we loaded new data
	[gameView sceneWasLoaded];
	[gameView selectNone];

	// reset the tables
	selectionProps = {};
	[tableView reloadData];
	[propertyTable reloadData];
	[behaviorTable reloadData];
	
	
}

-(@action) openDocument: (id) sender
{
	[self stop: nil];
	if ( (openDocument != undefined) || (renderContext.getObjects().length > 0) ) {
		var ok = confirm("Discard changes?");
		if (!ok) return;
	}
	[sceneOpener setAppController: self];
	[sceneOpener open: nil];
}

-(@action) openDocument: (CPString) name revision: (CPString) revision
{
	if (name == undefined) return;
	var s = serverInfo.baseUrl + "/" + serverInfo.databaseName + "/" + name + "?callback=couchcallback";
	if (revision != undefined) s = s + "&rev="+revision;
	console.log("openDocument: " + s);
	var req = [CPURLRequest requestWithURL: s];	
	var connection = [CPJSONPConnection sendRequest: req callback: "couchcallback" delegate:self];
}

- (void)connection:(CPJSONPConnection)aConnection didReceiveData:(Object)data
{
	console.log("didReceiveData:");
	console.log(data);
	connectionData = data;
}

-(void)connectionDidFinishLoading:(CPURLConnection)aConnection
{
	console.log("connectionDidFinishLoading");
	if (aConnection.identifier == "save") [self saveComplete: connectionData];
	else [self dataLoaded: connectionData];	
}
- (void)connection:(CPJSONPConnection)aConnection didFailWithError:(CPString)error
{
    //Ideally, we would do something smarter here.
    console.log(error);
}

-(void) dataLoaded: (Object) obj
{
	console.log("dataLoaded:", obj);
	var s = "Scene "+obj._rev+" was loaded";
	renderContext.clearScene();
	openDocument = obj;
	[theWindow setTitle: obj._id];
	window.document.title = "Mojo Editor: " + obj._id;

	// stop the playback
	[self stop: nil];

	// load the scene with the data
	var sceneData = obj.scene.children;
	sceneData.forEach(function(e){ [self createSceneObject: e withParent: renderContext.scene]});

	// tell the game view we loaded new data
	[gameView sceneWasLoaded];
	[gameView selectNone];

	// reset the tables
	selectionProps = {};
	[tableView reloadData];
	[propertyTable reloadData];
	[behaviorTable reloadData];

	// show the scene name in the gui
	[docNameField setStringValue: obj._id];
	docName = obj._id;
}

-(@action) saveDocument: (id) sender
{
	if (openDocument != undefined) {
		var scene = renderContext.objectifyContext();
		openDocument.scene = scene;
		openDocument.type = "scene";
		openDocument.updated = JSON.stringify(new Date());
		openDocument.updated_by = currentUser.name;
		openDocument.comment = prompt("Revision comments:");
		
		console.log("saving:",openDocument);
		//var s = serverInfo.baseUrl + "/" + serverInfo.databaseName + "/" + docName + "?callback=couchSaveCallback";
		url = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + openDocument._id;
		var request = [CPURLRequest requestWithURL: url];
		
		[request setHTTPMethod:"PUT"];
	    [request setValue:"application/json" forHTTPHeaderField:"Accept"];
	    [request setValue:"application/json" forHTTPHeaderField:"Content-Type"];
		var s = [CPString JSONFromObject:openDocument];
	    [request setHTTPBody:s];

//		var connection = [[CPJSONPConnection alloc] initWithRequest: request callback: nil delegate:self startImmediately: NO];
		var connection  = [CPURLConnection connectionWithRequest:request delegate:self];
	    connection.identifier = "save";
//		[connection start];

	} else {
		// ask for scene name
		var doc_id = prompt("Save as:");
		if (doc_id == "") return;
		docName = doc_id;
		var currentDate = JSON.stringify(new Date());
		openDocument = { comment: "initial creation", created: currentDate, created_by: currentUser.name, type: 'scene', updated: currentDate, scene: renderContext.objectifyContext() };
		url = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + doc_id;
		var request = [CPURLRequest requestWithURL: url];
		[request setHTTPMethod:"PUT"];
	    [request setValue:"application/json" forHTTPHeaderField:"Accept"];
	    [request setValue:"application/json" forHTTPHeaderField:"Content-Type"];
		var s = [CPString JSONFromObject: openDocument];
	    [request setHTTPBody:s];

//		var connection = [[CPJSONPConnection alloc] initWithRequest: request callback:nil delegate:self startImmediately: NO];
		var connection  = [CPURLConnection connectionWithRequest:request delegate:self];
	    connection.identifier = "save";
//		[connection start];
		openDocument._id = doc_id;
	}
}

-(void) saveComplete: (Object) obj
{
	console.log("saveComplete: ", obj);
	[self showNotificationTitle: @"Saved" message: @"The scene has been saved."];
	if (typeof(obj)=="string") obj = JSON.parse(obj);
	
	if (obj.error) {
		alert(obj.reason);
		return;
	}
	
	if (openDocument) {
		console.log("merging rev number:", obj.rev);
		[self showNotificationTitle: @"Merged" message: @"Merged with previous revision, now: " + obj.rev];
		// a document is already open, update its revision
		if (obj.rev) openDocument._rev = obj.rev;
		if (obj.id != openDocument.id) {
			openDocument.id = obj.id;
		}
	} else {
		// no document is open, so store all of its info
		openDocument = obj;
	}

	[docNameField setStringValue: obj['id']];
	
}

-(void) createSceneObject: (Object) o withParent: (Object) p
{

//	target = [gameView addGameObject: o parent: p];	
//	if (o.children.length > 0) o.children.forEach(function(c){ [gameView addGameObject: c withParent: target]});
	
	[gameView createSceneObject: o withParent: p];
}


-(void) reloadTables
{
	if (selectedItem>-1) {
		[gameView setSelectedItem: selectedItem];
		var o = renderContext.getObjectAtIndex(selectedItem);
		if (o) selectionProps = o.objectify();
	} else {
		selectionProps = {};
	}
	[tableView reloadData];
	[propertyTable reloadData];		
	[behaviorTable reloadData];		
}


#pragma mark Upload

-(@action) doUpload: (id) sender
{
	[uploadWindow makeKeyAndOrderFront: nil];
}

-(void) uploadButton:(UploadButton)button didChangeSelection:(CPArray)selection
{

}

-(void) uploadButton:(UploadButton)button didFailWithError:(CPString)anError
{
    console.log("Upload failed with this error: " + anError);
}

-(void) uploadButton:(UploadButton)button didFinishUploadWithData:(CPString)response
{
    console.log("Upload finished with this response: " + response);
    [button resetSelection];
}

-(void) uploadButtonDidBeginUpload:(UploadButton)button
{
    console.log("Upload has begun with selection: " + [button selection]);
}


@end


function couchcallback(obj)
{
	console.log("couchcallback");
	[appController dataLoaded: obj];
}

function couchSaveCallback(obj)
{
	console.log("couchSaveCallback");
	[appController saveComplete: obj];
}

function ISODateString(d) {
    function pad(n){
        return n<10 ? '0'+n : n
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

function reapplyPrefabs( which )
{
	if (which === undefined) {
		which = ["shape", "restitution", "bodyType", "centerOfMass",  "scale"];
	}
	// get prefab names
	var prefabNames = []; // = Object.keys(window.prefabs);
	for (var a in window.prefabs)
	{
		prefabNames.push(window.prefabs[a].name);
	}
	
	// walk the scene objects
	for ( var c in renderContext.scene.children_ )
	{ 
		var child = renderContext.getObjectAtIndex(c);
		var index = prefabNames.indexOf(child.name);
		if (index>=0) {
			var prefab = window.prefabs[Object.keys(window.prefabs)[index]];
			if (prefab == undefined) { 
				console.warn("could not find prefab", index, prefabs);
				continue;
			} 
			if (prefab.size) child.size = prefab.size;

			which.forEach( function( propNameToCopy ) {
				console.log("propNameToCopy:",propNameToCopy);
				if ( ! child.behaviors[0].obj.properties[propNameToCopy] == undefined )
					child.behaviors[0].obj.properties[propNameToCopy] = prefab.behaviors[0].properties[propNameToCopy];
			});
				
		} else {
			console.warn("could not find prefab", child.name);
		}
	}
}