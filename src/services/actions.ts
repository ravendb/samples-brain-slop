import { AiConversation } from "ravendb";
import { Action, ActionResult, AddNewTaskArguments } from "@/models/action";
import { sendToolMessage } from "@/repositories/chatRepo";
import { createProjectFromAction } from "@/repositories/projectRepo";
import { createTask } from "@/repositories/taskRepo";
import { Project } from "@/models/project";

export function receiveActions(chat: AiConversation) {
    chat.receive<Project>('CreateProject', (_request, args) => {
        console.log("Received CreateProject action with args:", args);
    })

    chat.receive<AddNewTaskArguments>('AddNewTask', (_request, args) => {
        console.log("Received AddNewTask action with args:", args);
    });
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

async function executeMappedAction(action: Action): Promise<string> {
    try {
        switch (action.name) {
            case "CreateProject":
                return await executeCreateProjectAction(action.arguments as Project);
            case "AddNewTask":
                return await executeAddNewTaskAction(action.arguments as AddNewTaskArguments);
            default:
                return `Action '${action.name}' (${action.id}) is not supported and was not executed.`;
        }
    } catch (error) {
        console.error(`Error executing action ${action.name} (${action.id}):`, error);
        return `An error occurred while executing action '${action.name}' (${action.id}).`;
    }
    
}

async function executeCreateProjectAction(args: Project): Promise<string> {
    const taskCount = args.tasks?.length || 0;
    await createProjectFromAction(args);
    return `Project '${args.title}' created successfully${taskCount > 0 ? ", with " + taskCount + " tasks." : "."}`;
}

async function executeAddNewTaskAction(args: AddNewTaskArguments): Promise<string> {
    await createTask(args.projectId, args.task);
    return `Task '${args.task.title}' created successfully.`;
}