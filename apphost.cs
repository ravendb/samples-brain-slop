#:sdk Aspire.AppHost.Sdk@13.4.6
#:package CommunityToolkit.Aspire.Hosting.RavenDB@13.4.0
#:package Aspire.Hosting.JavaScript@13.4.6

var builder = DistributedApplication.CreateBuilder(args);

var ravenServer = builder.AddRavenDB("ravenServer")
    .WithImageTag("7.2-latest")
    .WithDataVolume();

var ravenDb = ravenServer.AddDatabase("ravendb", databaseName: "BrainSlop", ensureCreated: true);

#pragma warning disable ASPIREJAVASCRIPT001
var app = builder.AddNextJsApp("brainslop", ".")
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints()
    .WithEnvironment("BROWSER", "none")
    .WithReference(ravenDb)
    .WaitFor(ravenDb);
#pragma warning restore ASPIREJAVASCRIPT001

builder.Build().Run();