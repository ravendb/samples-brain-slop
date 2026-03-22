import { store } from "@/db/ravendb";
import { AiConversation } from "ravendb";
import { Action, ActionResult } from "@/models/action";
import { sendToolMessage } from "@/repositories/chatRepo";
import { createProject } from "@/repositories/projectRepo";
import { createTask } from "@/repositories/taskRepo";
import { loadActions } from "@/repositories/actionRepo";

const AGENT_ID = process.env.AGENT_ID || "assistant";

export function receiveActions(chat: AiConversation) {
    chat.receive('CreateProject', (request, args) => {
        console.log(`Received ${request.name} action. id: ${request.toolId}, with args:`, args);
    })
}

export async function executeAction(chatId: string, action: Action): Promise<ActionResult> {
    const executionResponse = await executeMappedAction(action);
    console.log("Execution response for action:", executionResponse);

    const agentResponse = await sendToolMessage(chatId, {
        toolId: action.id,
        response: executionResponse
    });

    return {
        toolResponse: executionResponse,
        agentResponse: agentResponse,
        openActions: await loadActions(chatId)
    };
}

export async function rejectAction(chatId: string, action: Action): Promise<ActionResult> {
    const rejectionMessage = `
    Action '${action.name}' (${action.id}) was rejected by the user. 
    Dont try to execute it, and move on with the conversation.
    `;

    const agentResponse = await sendToolMessage(chatId, {
        toolId: action.id,
        response: rejectionMessage
    });

    return {
        toolResponse: rejectionMessage,
        agentResponse: agentResponse,
        openActions: await loadActions(chatId)
    };
}

async function executeMappedAction(action: Action): Promise<string> {
    if (action.name === "CreateProject") {
        const args = action.arguments;
        await createProject(args.title);
        const taskCount = args.tasks?.length ?? 0;
        if (taskCount > 0) {
            for (const task of args.tasks!) {
                await createTask(task.title);
            }
        }
        return `Project '${args.title}' created successfully${taskCount > 0 ? ", with " + taskCount + " tasks." : "."}`;
    }
    return `Action '${action.name}' (${action.id}) is not supported and was not executed.`;
}