import z from "zod";
import { ProjectSchema, EditProjectArgumentsSchema, DeleteProjectArgumentsSchema } from "./project";
import { AddNewTaskArgumentsSchema, EditTaskArgumentsSchema, DeleteTaskArgumentsSchema } from "./task";

export const schemas = {
    CreateProject: ProjectSchema,
    AddNewTask: AddNewTaskArgumentsSchema,
    EditTask: EditTaskArgumentsSchema,
    EditProject: EditProjectArgumentsSchema,
    DeleteProject: DeleteProjectArgumentsSchema,
    DeleteTask: DeleteTaskArgumentsSchema
};

export type ActionMap = {
    [K in keyof typeof schemas]: z.infer<(typeof schemas)[K]>;
};

export type Action<K extends keyof typeof schemas = keyof typeof schemas> = {
    name: K;
    arguments: z.infer<(typeof schemas)[K]>;
    id: string;
};

export type ActionResult = {
    agentResponse: string | null;
    toolResponse: string;
    openActions: Action[];
};

export type StoredAction = {
    name: Action["name"];
    arguments: string;
    toolId: string;
};

export type ToolResponse = {
    toolId: string;
    response: string;
};