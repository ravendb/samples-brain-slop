import { z } from "zod";
import { DateSchema } from "./date";
import { TaskSchema, Task } from "./task";

export class ProjectDocument {
    id?: string;
    title: string;
    description: string;
    dueDate?: string;
    taskIds: string[];

    constructor(title: string, description: string, dueDate?: string) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.taskIds = [];
    }

    setTasks(taskIds: string[]) {
        this.taskIds = taskIds;
    }

    toProject(tasks: Task[]): Project {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            tasks: tasks
        };
    }
}

export const ProjectSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    dueDate: DateSchema.optional(),
    tasks: z.array(TaskSchema).default([]),
}).strict();

export type Project = z.infer<typeof ProjectSchema>;