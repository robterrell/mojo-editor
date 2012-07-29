/*
 * RTCouchAnimationSearch.j
 *
 * Rob Terrell
 * Copyright 2011 Rob Terrell
 *
 */

@import <Foundation/CPObject.j>

@import "MKMediaPanel.j"
@import "../RTCouchServer.j"

@implementation RTCouchAnimationSearch : CPObject
{
}

+ (CPString)URL
{
    return [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/_design/assets/_view/animations?key=\"" + MKMediaPanelQueryReplacementString + "\"" + "&callback=" + CPJSONPCallbackReplacementString;
}

+ (CPString)identifier
{
    return "RTCouchAnimationSearch";
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

		console.log(o);
		var key = o.key;
        object.title = key + " (" + o.value.title +")";
        object.source = "Sprite Atlas Animation";
		var animation = o.value.animations[key];
		var size = {width: animation[0].w, height: animation[0].h};
		object.contentSize = CGSizeMake(size.width ? size.width : "unknown", size.height ? size.height : "unknown");
        object.thumbnailSize = CGSizeMake(180,135);

		var filename = Object.keys(o.value._attachments)[0];
        object.thumbnailURL = [[RTCouchServer sharedCouchServer] serverAndDatabase] + "/" + o.id + "/" + filename;
        object.mediaType = MKMediaTypeAnimation;
        object.url = object.thumbnailURL;
		object.description = o.value.description;
		object.subtype = "animation";
		object.animations = o.value.animations;
		r.push(object);
    }

    return r;
}

- (void)mediaSearchWithIdentifier:(CPString)anIdentifier failedWithError:(CPString)anError
{
    //todo errors
}

@end
