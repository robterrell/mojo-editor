/*
 * Jakefile
 * mojo
 *
 * Created by Rob Terrell on February 12, 2012.
 * Copyright 2012, Rob Terrell.
 */

var ENV = require("system").env,
    FILE = require("file"),
    JAKE = require("jake"),
    task = JAKE.task,
    FileList = JAKE.FileList,
    app = require("cappuccino/jake").app,
    configuration = ENV["CONFIG"] || ENV["CONFIGURATION"] || ENV["c"] || "Debug",
    OS = require("os");

app ("mojo", function(task)
{
    task.setBuildIntermediatesPath(FILE.join("Build", "mojo.build", configuration));
    task.setBuildPath(FILE.join("Build", configuration));

    task.setProductName("mojo");
    task.setIdentifier("com.robterrell.mojo");
    task.setVersion("1.0");
    task.setAuthor("Stinkbot LLC");
    task.setEmail("rob@robterrell.com");
    task.setSummary("mojo");
    task.setSources((new FileList("**/*.j")).exclude(FILE.join("Build", "**")));
    task.setResources(new FileList("Resources/**"));
    task.setIndexFilePath("index.html");
    task.setInfoPlistPath("Info.plist");

    if (configuration === "Debug")
        task.setCompilerFlags("-DDEBUG -g");
    else
        task.setCompilerFlags("-O");
});

task ("default", ["mojo"], function()
{
    printResults(configuration);
});

task ("build", ["default"]);

task ("debug", function()
{
    ENV["CONFIGURATION"] = "Debug";
    JAKE.subjake(["."], "build", ENV);
});

task ("release", function()
{
    ENV["CONFIGURATION"] = "Release";
    JAKE.subjake(["."], "build", ENV);
});

task ("run", ["debug"], function()
{
    OS.system(["open", FILE.join("Build", "Debug", "mojo", "index.html")]);
});

task ("run-release", ["release"], function()
{
    OS.system(["open", FILE.join("Build", "Release", "mojo", "index.html")]);
});

task ("deploy", ["release"], function()
{
    FILE.mkdirs(FILE.join("Build", "Deployment", "mojo"));
    OS.system(["press", "-f", FILE.join("Build", "Release", "mojo"), FILE.join("Build", "Deployment", "mojo")]);
    printResults("Deployment")
});

task ("desktop", ["release"], function()
{
    FILE.mkdirs(FILE.join("Build", "Desktop", "mojo"));
    require("cappuccino/nativehost").buildNativeHost(FILE.join("Build", "Release", "mojo"), FILE.join("Build", "Desktop", "mojo", "mojo.app"));
    printResults("Desktop")
});

task ("run-desktop", ["desktop"], function()
{
    OS.system([FILE.join("Build", "Desktop", "mojo", "mojo.app", "Contents", "MacOS", "NativeHost"), "-i"]);
});

task ("press", ["release"], function()
{
    FILE.mkdirs(FILE.join("Build", "Press", "Mockingbird"));
    OS.system(["press", "-f", FILE.join("Build", "Release", "mojo"), FILE.join("Build", "Press", "mojo")]);
});
 
task ("flatten", ["press"], function()
{
    FILE.mkdirs(FILE.join("Build", "Flatten", "mojo"));
    OS.system(["flatten", "-f", "--verbose", "--split", "3", "-c", "closure-compiler", FILE.join("Build", "Press", "mojo"), FILE.join("Build", "Flatten", "mojo")]);
});


function printResults(configuration)
{
    print("----------------------------");
    print(configuration+" app built at path: "+FILE.join("Build", configuration, "mojo"));
    print("----------------------------");
}
