import { DocumentStore } from "ravendb";
import { getAppConfig } from "@/lib/config";

declare global {
  var ravenStore: DocumentStore | undefined;
}

export function getStore(): DocumentStore {
  if (global.ravenStore) return global.ravenStore;

  const config = getAppConfig();
  if (!config) throw new Error("App not configured. Complete setup first.");

  const store = new DocumentStore([config.ravenUrl], config.ravenDb);
  store.initialize();
  global.ravenStore = store;
  return store;
}
