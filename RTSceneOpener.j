@import <Foundation/CPObject.j>

@implementation RTSceneOpener : CPObject
{
	@outlet CPWindow openWindow;
	@outlet CPTableView sceneList;
	@outlet CPTableView revisionList;
	@outlet CPTextField titleField;
	@outlet CPTextField modifiedDateField;
	@outlet CPTextField modifiedByField;
	@outlet CPScrollView sceneScroller;
	@outlet CPScrollView revisionScroller;

	Object scenes;
	Object revisions;
	CPJSONPConnection scenesConnnection;
	CPJSONPConnection revisionsConnection;
	Object data;
	
	CPObject appController @accessors;
	CPString selectedRevision;
}

- (id)init
{
	if(self = [super init])
	{
		scenes = {};
		revisions = {};
		
	}
	return self;
}

- (void)awakeFromCib
{
	var temp = [[CPTableView alloc] initWithFrame:[sceneScroller bounds]];
    [temp setDataSource:self];
	[temp setDelegate:self];
    [temp setAction: @selector(sceneListSelected:)];
	[temp setDoubleAction: @selector(openButton:)];
    [temp setUsesAlternatingRowBackgroundColors:YES];
	[temp setEnabled: YES];
	[temp setTarget:self];

    // add the first column
    var column = [[CPTableColumn alloc] initWithIdentifier:@"Title"];
    [[column headerView] setStringValue:"Title"];
    [column setWidth: 180];
    [temp addTableColumn:column];

	[sceneScroller setDocumentView: temp];
	sceneList = temp;
	
	[titleField setStringValue: @""];
	[modifiedDateField setStringValue: @""];
	[modifiedByField setStringValue: @""];

	var temp2 = [[CPTableView alloc] initWithFrame:[sceneScroller bounds]];
    [temp2 setDataSource:self];
	[temp2 setDelegate:self];
    [temp2 setAction: @selector(revisionListSelected:)];
    [temp2 setUsesAlternatingRowBackgroundColors:YES];
	[temp2 setEnabled: YES];
	[temp2 setTarget: self];

    // add the first column
    var column0 = [[CPTableColumn alloc] initWithIdentifier:@"Number"];
    [[column0 headerView] setStringValue:"#"];
    [column0 setWidth: 25];
    [temp2 addTableColumn:column0];

    var column = [[CPTableColumn alloc] initWithIdentifier:@"Revision"];
    [[column headerView] setStringValue:"Revision"];
    [column setWidth: 240];
    [temp2 addTableColumn:column];

    var column2 = [[CPTableColumn alloc] initWithIdentifier:@"Status"];
    [[column2 headerView] setStringValue:"Status"];
    [column2 setWidth: 106];
    [temp2 addTableColumn:column2];

	[revisionScroller setDocumentView: temp2];
	revisionList = temp2;

}

-(@action) open: (id) sender
{
	// load the scene list

	[openWindow makeKeyAndOrderFront: sender];
	selectedRevision = undefined;
	var s = serverInfo.baseUrl + "/" + serverInfo.databaseName + "/_design/assets/_view/scenes";
	var req = [CPURLRequest requestWithURL: s];	
	scenesConnection = [CPJSONPConnection sendRequest: req callback: "callback" delegate:self];
	[self sceneListSelected: nil];
}

-(@action) sceneListSelected: (id) sender
{
	var row = [sceneList selectedRow];
	console.log("row " + row);
	if (row>=0) { 
		[titleField setStringValue: scenes[row].key];
		[modifiedByField setStringValue: scenes[row].value.updated_by];
		var s = scenes[row].value.updated;
		var d = new Date();
		d.setISO8601(s);
		[modifiedDateField setStringValue: d.toString()];
		// get revisions
		var s = serverInfo.baseUrl + "/" + serverInfo.databaseName + "/" + scenes[row].key + "?revs_info=true";
		var req = [CPURLRequest requestWithURL: s];	
		revisionsConnection = [CPJSONPConnection sendRequest: req callback: "callback" delegate:self];
	}
}

-(@action) revisionListSelected: (id) sender
{
	var row = [revisionList selectedRow];
	if (row>=0) { 
		if (revisions[row].status == "available") selectedRevision = revisions[row].rev;
		else selectedRevision = undefined;
	}
}

/*- (void)tableViewSelectionDidChange:(CPNotification )notification
{
	var row = [sceneList selectedRow];
	console.log("row " + row);
	if (row>=0) { 
		[titleField setStringValue: scenes[row].key];
		[modifiedByField setStringValue: scenes[row].value.updated_by];
		var d = new Date(scenes[row].value.updated_on);
		[modifiedDateField setStringValue: d.toString()];
		// get revisions
		var s = serverInfo.baseUrl + "/" + serverInfo.databaseName + "/" + scenes[row].key + "?revs_info=true";
		var req = [CPURLRequest requestWithURL: s];	
		revisionsConnection = [CPJSONPConnection sendRequest: req callback: "callback" delegate:self];
	}
}*/

-(@action) openButton: (id) sender
{
	[appController openDocument: [titleField stringValue] revision: selectedRevision];
	[openWindow close];
}


-(int) numberOfRowsInTableView: (CPTableView) t
{
	if (t == sceneList) return scenes.length;
	if (t == revisionList) return revisions.length;
}


- (id)tableView:(CPTableView)t objectValueForTableColumn:(CPTableColumn)tableColumn row:(int)row
{
	if (t == sceneList) if (scenes.length>0) return @"" + scenes[row].key;
	if (t == revisionList) if (revisions.length>0) {
		if ([tableColumn identifier] == "Status") return @"" + revisions[row].status;
		if ([tableColumn identifier] == "Number") return @"" + revisions[row].rev.split("-")[0];
		else return @"" + revisions[row].rev.split("-")[1];
	}
	return @"";
}


- (void)connection:(CPJSONPConnection)aConnection didReceiveData:(Object)data_
{
	data = data_;
}


-(void)connectionDidFinishLoading:(CPURLConnection)aConnection
{
	if (aConnection == scenesConnection) {
		scenes = data.rows;
		[sceneList reloadData];
	} else {
		console.log(data);
		revisions = data._revs_info;
		[revisionList reloadData];
	}
}

@end

Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}