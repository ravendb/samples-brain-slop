import { Project, ProjectSchema } from "./project";
import { AddNewTaskArguments, AddNewTaskArgumentsSchema, EditTaskArguments, EditTaskArgumentsSchema } from "./task";

export type ActionArguments = Project | AddNewTaskArguments | EditTaskArguments;

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

type Parser = typeof ProjectSchema | typeof AddNewTaskArgumentsSchema | typeof EditTaskArgumentsSchema;

export const parsers: Record<string, Parser> = {
    "AddNewTask": AddNewTaskArgumentsSchema,
    "CreateProject": ProjectSchema,
    "EditTask": EditTaskArgumentsSchema
};