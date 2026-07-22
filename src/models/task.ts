import z from "zod";
import { DateSchema } from "./date";

export type TaskPriority = "low" | "normal" | "high";

export class TaskDocument {
    id?: string;
    projectId: string;
    title: string;
    completed: boolean;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    createdBy?: string;

    constructor(projectId: string, title: string, description?: string, priority?: TaskPriority, dueDate?: string, assigneeId?: string, createdBy?: string) {
        this.projectId = projectId;
        this.title = title;
        this.completed = false;
        this.description = description;
        this.priority = priority ?? "normal";
        this.dueDate = dueDate;
        this.assigneeId = assigneeId;
        this.createdBy = createdBy;
    }
}

export const TaskSchema = z.object({
    id: z.string().optional(),
    title: z.string().describe("Short title of the task."),
    description: z.string().optional().describe("Optional detailed description of the task."),
    priority: z.enum(["low", "normal", "high"]).default("normal").describe("Priority of the task."),
    dueDate: DateSchema.optional().describe("The task's deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field."),
    completed: z.boolean().default(false).describe("Is the task completed or not."),
    assigneeId: z.string().optional().describe("The member ID of the person this task is assigned to. Use the member ID from the conversation context if mentioned."),
    createdBy: z.string().optional().describe("The member ID of the person who created this task. Set server-side."),
})

export type Task = z.infer<typeof TaskSchema>;

export const NewTaskSchema = TaskSchema.omit({ id: true, completed: true, createdBy: true });

export type NewTask = z.infer<typeof NewTaskSchema>;

export const AddNewTaskArgumentsSchema = z.object({
    projectId: z.string().describe("The document ID of the project the task is added to. NOT THE PROJECT TITLE. The document ID that RavenDB can use to load the document. If you don't know what the ID is, ask for it."),
    projectTitle: z.string().describe("The title of the project so the user would know which project is being updated."),
    task: NewTaskSchema
})

export type AddNewTaskArguments = z.infer<typeof AddNewTaskArgumentsSchema>;

export const EditTaskArgumentsSchema = z.object({
    taskId: z.string().describe("The ID of the task to edit."),
    currentTitle: z.string().describe("The current title of the task to display to the user which task is being edited."),
    assigneeName: z.string().optional().describe("The username of the new assignee. Required when updates.assigneeId is set — look up the username using GetTeamMembers."),
    updates: TaskSchema.omit({ id: true }).partial().extend({ completed: z.boolean().optional() })
})

export type EditTaskArguments = z.infer<typeof EditTaskArgumentsSchema>;

export const DeleteTaskArgumentsSchema = z.object({
    taskId: z.string().describe("The ID of the task to be deleted."),
    taskTitle: z.string().describe("The title of the task to be deleted."),
    projectId: z.string().describe("The ID of the project the task belongs to."),
    projectTitle: z.string().describe("The title of the project the task belongs to.")
})

export type DeleteTaskArguments = z.infer<typeof DeleteTaskArgumentsSchema>;
