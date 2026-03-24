import { Project } from "./project";

export type ActionStatus = "pending" | "approved" | "rejected";

export type Action = {
    name: string;
    arguments: Project;
    id: string;
}

export type ActionResult = {
    agentResponse: string | null;
    toolResponse: string;
    openActions: Action[];
};

export type StoredAction = {
    name: string;
    arguments: string;
    toolId: string;
}

export type ToolResponse = {
    toolId: string;
    response: string;
}
