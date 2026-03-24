import { AiConversation } from "ravendb";
import { Action, ActionResult } from "@/models/action";
import { sendToolMessage } from "@/repositories/chatRepo";
import { createProjectFromAction } from "@/repositories/projectRepo";

export function receiveActions(chat: AiConversation) {
    chat.receive('CreateProject', (request, args) => {
        console.log(`Received ${request.name} action. id: ${request.toolId}, with args:`, args);
    })
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
    if (action.name === "CreateProject") {
        const args = action.arguments;
        const taskCount = args.tasks?.length || 0;

        await createProjectFromAction(args);

        return `Project '${args.title}' created successfully${taskCount > 0 ? ", with " + taskCount + " tasks." : "."}`;
    }
    return `Action '${action.name}' (${action.id}) is not supported and was not executed.`;
}