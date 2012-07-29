goog.provide('mojo.util');

var global = this;

// String function
mojo.replaceCharAt=function(index, char) {
  return this.substr(0, index) + char + this.substr(index+char.length);
}


mojo.getProtocolAndPathOfUrl = function(s)
{
	var a = s.split("/");
	var protocol = a[0];
	var path = "";
	for (var i=3; i<a.length; i++) { path = path + "/" + a[i]};
	return { 'protocol': protocol, 'path': path};
}

mojo.getPathOfUrl = function(s)
{
	var start = 0;
	if (s.indexOf("http://") != -1) start = 3;
	var a = s.split("/");
	var path = "";
	for (var i=start; i<a.length; i++) { path = (path.length) ? path + "/" + a[i] : a[i]};
	return path;
}

mojo.jsonp = function(url)
{                
   var script = document.createElement("script");        
   script.setAttribute("src",url);
   script.setAttribute("type","text/javascript");                
   document.body.appendChild(script);
}


mojo.loadScript = function( o, url)
{
   global[o] = undefined;
   window[o] = undefined;
   var script = document.createElement("script");        
   script.setAttribute("src",url);
   script.setAttribute("type","text/javascript");                
   document.body.appendChild(script);
}

mojo.loadBehavior = function( o, url)
{
   mojo.behavior[o] = undefined;
   var script = document.createElement("script");        
   script.setAttribute("src",url+"?"+Math.random() *1000);
   script.setAttribute("type","text/javascript");                
   document.body.appendChild(script);
}
