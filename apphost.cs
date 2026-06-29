#:sdk Aspire.AppHost.Sdk@13.4.6
#:package CommunityToolkit.Aspire.Hosting.RavenDB@13.4.0
#:package Aspire.Hosting.JavaScript@13.4.6

using CommunityToolkit.Aspire.Hosting.RavenDB;

var builder = DistributedApplication.CreateBuilder(args);

var ravenSettings = RavenDBServerSettings.Unsecured();
ravenSettings.Port = 9538;
ravenSettings.TcpPort = 41354;

var ravenServer = builder.AddRavenDB("ravenServer", ravenSettings)
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