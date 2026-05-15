import { DocumentStore } from "ravendb";
import { getAppConfig } from "@/lib/config";

declare global {
  var ravenStore: DocumentStore | undefined;
  var ravenStoreKey: string | undefined;
}

export function getStore(): DocumentStore {
  const config = getAppConfig();
  if (!config) throw new Error("App not configured. Complete setup first.");

  const key = `${config.ravenUrl}|${config.databaseName}`;
  if (global.ravenStore && global.ravenStoreKey === key) return global.ravenStore;

  global.ravenStore?.dispose();
  const store = new DocumentStore([config.ravenUrl], config.databaseName);
  store.initialize();
  global.ravenStore = store;
  global.ravenStoreKey = key;
  return store;
}
