import { AiConversation } from "ravendb";
import { Action, ActionResult, ActionMap } from "@/models/action";
import { sendToolMessage } from "@/repositories/chatRepo";
import { createProjectFromAction, editProject, deleteProject } from "@/repositories/projectRepo";
import { createTask, deleteTask, editTask } from "@/repositories/taskRepo";

const executors: { [K in keyof ActionMap]: (args: ActionMap[K]) => Promise<string> } = {
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

export async function executeAction(chatId: string, action: Action): Promise<ActionResult> {
    const executionResponse = await executeMappedAction(action);
    console.log("Execution response for action:", executionResponse);

    const result = await sendToolMessage(chatId, {
        toolId: action.id,
        response: executionResponse
    });

    return {
        toolResponse: executionResponse,
        agentResponse: result.reply,
        openActions: result.actions
    };
}

export async function rejectAction(chatId: string, action: Action): Promise<ActionResult> {
    const rejectionMessage = `
    Action '${action.name}' (${action.id}) was rejected by the user. 
    Dont try to execute it, and move on with the conversation.
    `;

    const result = await sendToolMessage(chatId, {
        toolId: action.id,
        response: rejectionMessage
    });

    return {
        toolResponse: rejectionMessage,
        agentResponse: result.reply,
        openActions: result.actions
    };
}

async function executeMappedAction<K extends keyof ActionMap>(action: Action<K>) {
    try {
        const executor = executors[action.name];
        return await executor(action.arguments as ActionMap[K]);
    } catch (error) {
        console.error(`Error executing action ${action.name} (${action.id}):`, error);
        return `An error occurred while executing action '${action.name}' (${action.id}).`;
    }
}

async function executeCreateProjectAction(args: ActionMap["CreateProject"]) {
    const taskCount = args.tasks?.length || 0;
    await createProjectFromAction(args);
    return `Project '${args.title}' created successfully${taskCount > 0 ? ", with " + taskCount + " tasks." : "."}`;
}

async function executeAddNewTaskAction(args: ActionMap["AddNewTask"]) {
    await createTask(args.projectId, args.task);
    return `Task '${args.task.title}' created successfully.`;
}

async function executeEditTaskAction(args: ActionMap["EditTask"]) {
    const updatedTask = await editTask(args.taskId, args.updates);
    return `Task '${args.currentTitle}' updated successfully. Updated task: ${updatedTask}`;
}

async function executeEditProjectAction(args: ActionMap["EditProject"]) {
    const updatedProject = await editProject(args.projectId, args.updates);
    return `Project '${args.currentTitle}' updated successfully. Updated project: ${updatedProject}`;
}

async function executeDeleteProjectAction(args: ActionMap["DeleteProject"]) {
    await deleteProject(args.projectId);
    return `Project '${args.title}' deleted successfully.`;
}

async function executeDeleteTaskAction(args: ActionMap["DeleteTask"]) {
    await deleteTask(args.projectId, args.taskId);
    return `Task '${args.taskTitle}' from project '${args.projectTitle}' deleted successfully.`;
}