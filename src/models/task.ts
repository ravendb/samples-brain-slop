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
.strict();

export type Task = z.infer<typeof TaskSchema>;