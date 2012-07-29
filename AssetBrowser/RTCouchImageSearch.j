/*
 * RTCouchImahgeSearch.j
 *
 * Rob Terrell
 * Copyright 2011 Rob Terrell
 *
 */

@import <Foundation/CPObject.j>

@import "MKMediaPanel.j"
@import "../RTCouchServer.j"

@implementation RTCouchImageSearch : CPObject
{
}

+ (CPString)URL
{
	var endChar = "\\"+'ufff0';
	var s = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/_design/assets/_view/imagesByTag?startkey=\"" + MKMediaPanelQueryReplacementString + "\"" + "&endkey=\"" + MKMediaPanelQueryReplacementString + endChar + "\"&callback=" + CPJSONPCallbackReplacementString;
	console.log(s);
	return s;
	//[[RTCouchServer sharedCouchServer] serverAndDatabase] + "/_design/assets/_view/imagesByTag?startkey=\"" + MKMediaPanelQueryReplacementString + "\"" + "&endkey=\"" + MKMediaPanelQueryReplacementString + endChar + "\"&callback=" + CPJSONPCallbackReplacementString;
}

+ (CPString)identifier
{
    return "RTCouchImageSearch";
}

- (CPArray)mediaObjectsForIdentifier:(CPString)anIdentifier data:(Object)data
{
//    if (data.responseStatus !== 200)
//        return [];

    var results = data.rows,
        count = results.length;

	var r = [];
		
	results.forEach( function(e,i) {
		var o = e.value;
		if (o.size) return;
		var img = new Image();
		var doc_id = o._id+'';
		img.onload = function() {
			o.size = {"width": img.width, "height": img.height};
			console.log("updating asset size", doc_id, o.size);
			[[CPNotificationCenter defaultCenter] postNotificationName:"showNotification" object: @"Updating size of asset " + doc_id];
			var url = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + doc_id;
			var request = [CPURLRequest requestWithURL: url];
			[request setHTTPMethod:"PUT"];
		    [request setValue:"application/json" forHTTPHeaderField:"Accept"];
		    [request setValue:"application/json" forHTTPHeaderField:"Content-Type"];
		    [request setHTTPBody: [CPString JSONFromObject: o]];
			var connection  = [CPURLConnection connectionWithRequest:request delegate:self];				
		}
		img.src = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + doc_id + "/" + doc_id;
	});
	
    for (var i = 0; i < count; i++)
    {
        var object = {}; //
		var o = results[i];

        object.title = o.value.title;
        object.source = "Image";
		var size = o.value.size || {};
		object.contentSize = CGSizeMake(size.width ? size.width : 100, size.height ? size.height : 100);
        //object.contentSize = CGSizeMake(size.width, size.height);
        object.thumbnailSize = CGSizeMake(180,135);
		key = o.key;
		var filename = Object.keys(o.value._attachments)[0];
        object.thumbnailURL = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + o.id + "/" + filename;
        object.mediaType = MKMediaTypeImage;
        object.url = object.thumbnailURL;
		object.description = o.value.description;
		r.push(object);
    }

    return r;
}

- (void)mediaSearchWithIdentifier:(CPString)anIdentifier failedWithError:(CPString)anError
{
    //todo errors
}

@end
