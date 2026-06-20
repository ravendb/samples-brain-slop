import { AiConversation } from "ravendb";
import { Action, ActionResult, ActionMap } from "@/models/action";
import { sendToolMessage } from "@/repositories/chatRepo";
import { createProjectFromAction, editProject, deleteProject } from "@/repositories/projectRepo";
import { createTask, deleteTask, editTask } from "@/repositories/taskRepo";

type ExecutorContext = { memberId?: string; userId?: string };

const executors: { [K in keyof ActionMap]: (args: ActionMap[K], ctx: ExecutorContext) => Promise<string> } = {
    CreateProject: executeCreateProjectAction,
    AddNewTask: executeAddNewTaskAction,
    EditTask: executeEditTaskAction,
    EditProject: executeEditProjectAction,
    DeleteProject: executeDeleteProjectAction,
    DeleteTask: executeDeleteTaskAction
};

export function receiveActions(chat: AiConversation) {
    const actionNames = Object.keys(executors)
    for (const name of actionNames) {
        chat.receive(name, (_request, args) => {
            console.log(`Received ${name} action with args:`, args);
        });
    }
}

export async function executeAction(chatId: string, action: Action, onChunk: (chunk: string) => void, ctx: ExecutorContext = {}): Promise<ActionResult> {
    const executionResponse = await executeMappedAction(action, ctx);
    console.log("Execution response for action:", executionResponse);

    return await sendToolMessage(
        chatId,
        { toolId: action.id, response: executionResponse },
        onChunk
    )
}

export async function rejectAction(chatId: string, action: Action, onChunk: (chunk: string) => void): Promise<ActionResult> {
    const rejectionMessage = `
    Action '${action.name}' (${action.id}) was rejected by the user.
    Dont try to execute it, and move on with the conversation.
    `;

    return await sendToolMessage(
        chatId,
        { toolId: action.id, response: rejectionMessage },
        onChunk
    )
}

export async function denyActionPermission(chatId: string, action: Action, reason: string, onChunk: (chunk: string) => void): Promise<ActionResult> {
    const denialMessage = `Action '${action.name}' (${action.id}) could not be executed because the current user does not have permission. Reason: ${reason}. Inform the user they don't have permission to perform this action. Do not offer to escalate, request on their behalf, or suggest any workaround — there is nothing more you can do.`;

    return await sendToolMessage(
        chatId,
        { toolId: action.id, response: denialMessage },
        onChunk
    )
}

export type DemoActionContext = { projectId?: string; taskIds?: string[] };

export async function executeDemoAction(type: string, args: unknown): Promise<DemoActionContext> {
    if (type === "CreateProject") {
        const result = await createProjectFromAction(args as ActionMap["CreateProject"], "demo");
        return result;
    }
    if (!Object.prototype.hasOwnProperty.call(executors, type)) throw new Error(`Unknown action type: ${type}`);
    const executor = executors[type as keyof ActionMap];
    await executor(args as never, {});
    return {};
}

async function executeMappedAction<K extends keyof ActionMap>(action: Action<K>, ctx: ExecutorContext) {
    try {
        const executor = executors[action.name];
        return await executor(action.arguments as ActionMap[K], ctx);
    } catch (error) {
        console.error(`Error executing action ${action.name} (${action.id}):`, error);
        return `An error occurred while executing action '${action.name}' (${action.id}).`;
    }
}

async function executeCreateProjectAction(args: ActionMap["CreateProject"], ctx: ExecutorContext) {
    const taskCount = args.tasks?.length || 0;
    await createProjectFromAction(args, ctx.userId ?? "", ctx.memberId);
    return `Project '${args.title}' created successfully${taskCount > 0 ? ", with " + taskCount + " tasks." : "."}`;
}

async function executeAddNewTaskAction(args: ActionMap["AddNewTask"], ctx: ExecutorContext) {
    await createTask(args.projectId, args.task, ctx.memberId);
    return `Task '${args.task.title}' created successfully.`;
}

async function executeEditTaskAction(args: ActionMap["EditTask"], _ctx: ExecutorContext) {
    const updatedTask = await editTask(args.taskId, args.updates);
    return `Task '${args.currentTitle}' updated successfully. Updated task: ${updatedTask}`;
}

async function executeEditProjectAction(args: ActionMap["EditProject"], _ctx: ExecutorContext) {
    const updatedProject = await editProject(args.projectId, args.updates);
    return `Project '${args.currentTitle}' updated successfully. Updated project: ${updatedProject}`;
}

async function executeDeleteProjectAction(args: ActionMap["DeleteProject"], _ctx: ExecutorContext) {
    await deleteProject(args.projectId);
    return `Project '${args.title}' deleted successfully.`;
}

async function executeDeleteTaskAction(args: ActionMap["DeleteTask"], _ctx: ExecutorContext) {
    await deleteTask(args.taskId);
    return `Task '${args.taskTitle}' from project '${args.projectTitle}' deleted successfully.`;
}