import fs from "fs";
import path from "path";

export interface AppConfig {
  ravenUrl: string;
  databaseName: string;
  agentId: string;
  openAiApiKey: string;
  mainModel: string;
  smallModel: string;
  ravenDbLicense: string;
}

const CONFIG_PATH = path.join(process.cwd(), ".app-config.json");

export function getAppConfig(): AppConfig | null {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    if (process.env.RAVENDB_URI) config.ravenUrl = process.env.RAVENDB_URI;
    if (process.env.RAVENDB_DATABASE) config.databaseName = process.env.RAVENDB_DATABASE;
    return config;
  } catch {
    return null;
  }
}

export function writeAppConfig(config: AppConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export function getAgentId(): string {
  return getAppConfig()?.agentId ?? "assistant";
}
