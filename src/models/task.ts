import z from "zod";
import { DateSchema } from "./date";

export type TaskPriority = "low" | "normal" | "high";

export class TaskDocument {
    id?: string;
    title: string;
    completed: boolean;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;

    constructor(title: string, description?: string, priority?: TaskPriority, dueDate?: string) {
        this.title = title;
        this.completed = false;
        this.description = description;
        this.priority = priority ?? "normal";
        this.dueDate = dueDate;
    }
}

export const TaskSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(["low", "normal", "high"]).default("normal"),
    dueDate: DateSchema.optional(),
    completed: z.boolean().default(false)
})

export type Task = z.infer<typeof TaskSchema>;

export const AddNewTaskArgumentsSchema = z.object({
    projectId: z.string(),
    projectTitle: z.string(),
    task: TaskSchema
})

export type AddNewTaskArguments = z.infer<typeof AddNewTaskArgumentsSchema>;

export const EditTaskArgumentsSchema = z.object({
    taskId: z.string(),
    currentTitle: z.string(),
    updates: z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(["low", "normal", "high"]),
        dueDate: DateSchema,
        completed: z.boolean()
    }).partial()
})

export type EditTaskArguments = z.infer<typeof EditTaskArgumentsSchema>;

export const DeleteTaskArgumentsSchema = z.object({
    taskId: z.string(),
    taskTitle: z.string(),
    projectId: z.string(),
    projectTitle: z.string()
})

export type DeleteTaskArguments = z.infer<typeof DeleteTaskArgumentsSchema>;