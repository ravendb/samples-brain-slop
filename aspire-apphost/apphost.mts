import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

// Fixed host ports (HTTP 9538 / TCP 41354) avoid conflicts with a local
// RavenDB instance and other samples in this repo.
const ravenServer = await builder.addRavenDB('ravenServer')
    .withImageTag('7.2-latest')
    .withDataVolume()
    .withEndpointCallback('http', async e => { await e.port.set(9538); })
    .withEndpointCallback('tcp', async e => { await e.port.set(41354); });

// The resource name 'ravendb' drives the RAVENDB_URI / RAVENDB_DATABASE
// env vars the Next.js app reads — do not rename.
const ravenDb = await ravenServer.addDatabase('ravendb', {
    databaseName: 'BrainSlop',
    ensureCreated: true,
});

await builder.addNextJsApp('brainslop', '..')
    .withHttpEndpoint({ env: 'PORT' })
    .withExternalHttpEndpoints()
    .withEnvironment('BROWSER', 'none')
    .withReference(ravenDb)
    .waitFor(ravenDb);

await builder.build().run();
