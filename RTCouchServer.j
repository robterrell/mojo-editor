@import <Foundation/CPObject.j>

var SharedCouchServer = nil;

@implementation RTCouchServer : CPObject
{
	CPString baseUrl @accessors;
	CPString databaseName @accessors;
}

+ (id)sharedCouchServer
{
	console.log("sharedCouchServer");
    if (!SharedCouchServer) {
        SharedCouchServer = [[RTCouchServer alloc] init];
    }
    return SharedCouchServer;
}

- (id)init
{
	var self;
	if(self = [super init])
	{
		if (document.location.href.indexOf("file:") == 0) {
			baseUrl = "http://localhost:5984";
		}
		else {
			baseUrl = window.serverInfo.baseUrl;
		}
		databaseName = window.serverInfo.databaseName | "mojo_scenes";
	}
	return self;
}

-(CPString) baseUrl
{
	return baseUrl;
}

-(CPString) databaseName
{
	return databaseName;
}

-(CPString) serverAndDatabase
{
	return window.serverInfo.baseUrl + "/" + window.serverInfo.databaseName;
}

-(CPString) remoteServerAndDatabase
{
	return window.serverInfo.remoteBaseUrl + "/" + window.serverInfo.databaseName;
}
