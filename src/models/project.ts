import { z } from "zod";
import { DateSchema } from "./date";
import { TaskSchema, NewTaskSchema } from "./task";

export class ProjectDocument {
    id?: string;
    title: string;
    description: string;
    dueDate?: string;
    teamId: string;
    createdBy: string;

    constructor(title: string, description: string, teamId: string, createdBy: string, dueDate?: string) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.teamId = teamId;
        this.createdBy = createdBy;
    }
}

export const ProjectSchema = z.object({
    id: z.string().optional(),
    title: z.string().describe("The title of the project."),
    description: z.string().describe("A clear description of the project's purpose, goals, and context."),
    dueDate: DateSchema.optional().describe("The project deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field."),
    teamId: z.string().describe("The ID of the team this project belongs to. Use the team ID from the conversation context."),
    createdBy: z.string().describe("The ID of the user creating the project. Use the user ID from the conversation context."),
    tasks: z.array(TaskSchema).default([]),
})

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectArgumentsSchema = z.object({
    title: ProjectSchema.shape.title,
    description: ProjectSchema.shape.description,
    dueDate: ProjectSchema.shape.dueDate,
    teamId: ProjectSchema.shape.teamId,
    tasks: z.array(NewTaskSchema.strict()).default([]).describe("A list of initial tasks for the project. Can be empty if no tasks are specified or inferred."),
})

export type CreateProjectArguments = z.infer<typeof CreateProjectArgumentsSchema>;

export const EditProjectArgumentsSchema = z.object({
    projectId: z.string().describe("The ID of the project to edit."),
    currentTitle: z.string().describe("The current title of the project to display to the user which project is being edited."),
    updates: ProjectSchema.omit({ id: true, tasks: true }).partial(),
})

export type EditProjectArguments = z.infer<typeof EditProjectArgumentsSchema>;

export const DeleteProjectArgumentsSchema = z.object({
    projectId: z.string().describe("The ID of the project to delete."),
    title: z.string().describe("The title of the project to delete.")
})

export type DeleteProjectArguments = z.infer<typeof DeleteProjectArgumentsSchema>;
