import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Must be in YYYY-MM-DD format",
});

const TaskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    dueDate: isoDateSchema.optional(),
})
.strict();

export const CreateProjectArgumentntsSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    dueDate: isoDateSchema.optional(),
    tasks: z.array(TaskSchema).optional(),
}).strict();

type CreateProjectArguments = z.infer<typeof CreateProjectArgumentntsSchema>;

export type ActionStatus = "pending" | "approved" | "rejected";

export type Action = {
    name: string;
    arguments: CreateProjectArguments;
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
