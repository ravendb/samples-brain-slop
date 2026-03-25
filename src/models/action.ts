import { Project, ProjectSchema } from "./project";
import { TaskSchema } from "./task";
import { z } from "zod";

export type ActionArguments = Project | AddNewTaskArguments;

export type Action<T extends ActionArguments = ActionArguments> = {
    name: string;
    arguments: T;
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

export const AddNewTaskArgumentsSchema = z.object({
    projectId: z.string(),
    projectTitle: z.string(),
    task: TaskSchema
}).strict();

export type AddNewTaskArguments = z.infer<typeof AddNewTaskArgumentsSchema>;

type Parser = typeof ProjectSchema | typeof AddNewTaskArgumentsSchema;

export const parsers: Record<string, Parser> = {
    "AddNewTask": AddNewTaskArgumentsSchema,
    "CreateProject": ProjectSchema
};