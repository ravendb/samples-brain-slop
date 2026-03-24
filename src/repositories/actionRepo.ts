import { Action, StoredAction } from "@/models/action";
import { ProjectSchema } from "@/models/project";
import { store } from "@/db/ravendb";

export async function loadActions(chatId: string) {
    const session = await store.openSession();
    const chatDocument = await session.advanced.rawQuery<{ openActionCalls: unknown }>(`
            from @conversations
            where id() = $chatId
            select OpenActionCalls as openActionCalls
        `)
        .addParameter("chatId", chatId)
        .first();
    
    return extractActions(chatDocument.openActionCalls);
}

export function extractActions(openActionCalls: unknown): Action[] {
    if (!openActionCalls || typeof openActionCalls !== "object") {
        return [];
    }

    const storedActionCalls = Object.values(openActionCalls) as {
        Name: string;
        Arguments: string;
        ToolId: string;
    }[];

    const actionCalls: Action[] = []
    
    storedActionCalls.forEach(call => {
        const parsedArguments = parseArguments(call.Arguments);
        if (parsedArguments) {  
            actionCalls.push({
                name: call.Name,
                arguments: parsedArguments,
                id: call.ToolId
            });
        }
    });

    return actionCalls;
}

export function formatActions(storedActions: StoredAction[]): Action[] {
    const actions: Action[] = [];

    storedActions.forEach(call => {
        const parsedArguments = parseArguments(call.arguments);
        if (parsedArguments) {
            actions.push({
                id: call.toolId,
                name: call.name,
                arguments: parsedArguments
            });
        }
    });

    return actions;
}
    


function parseArguments(argumentsString: string) {
    try {
        const jsonArguments = JSON.parse(argumentsString);
        return ProjectSchema.parse(jsonArguments);
    } catch {
        return null;
    }
}