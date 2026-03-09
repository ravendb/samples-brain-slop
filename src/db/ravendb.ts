import { DocumentStore } from "ravendb"

declare global {
  var ravenStore: DocumentStore | undefined
}

export const store =
  global.ravenStore ??
  new DocumentStore(
    [process.env.RAVEN_URL!],
    process.env.RAVEN_DB!
  )

if (!global.ravenStore) {
  store.initialize()
  global.ravenStore = store
}