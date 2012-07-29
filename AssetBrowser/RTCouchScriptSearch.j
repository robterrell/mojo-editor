/*
 * RTCouchScriptSearch.j
 *
 * Rob Terrell
 * Copyright 2011 Rob Terrell *
 */


@import <Foundation/CPObject.j>

@import "MKMediaPanel.j"
@import "../RTCouchServer.j"

@implementation RTCouchScriptSearch : CPObject
{
}

+ (CPString)URL
{
    return [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/_design/assets/_view/scriptsByTag?key=\"" + MKMediaPanelQueryReplacementString + "\"" + "&callback=" + CPJSONPCallbackReplacementString;
}

+ (CPString)identifier
{
    return "RTCouchScriptSearch";
}

- (CPArray)mediaObjectsForIdentifier:(CPString)anIdentifier data:(Object)data
{
//    if (data.responseStatus !== 200)
//        return [];

    var results = data.rows,
        count = results.length;

	var r = [];
    for (var i = 0; i < count; i++)
    {
        var object = {}; //
		var o = results[i];

        object.title = o.value.title;
        object.source = "Mojo Asset Server";
		var size = o.value.size;
        object.contentSize = CGSizeMake(size.width, size.height);
        object.thumbnailSize = CGSizeMake(180,135);
//        object.contentSize = CGSizeMake(object.o_width ? object.o_width : "unknown", object.o_height ? object.o_height : "unknown");
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
