import { Action, schemas, StoredAction } from "@/models/action";

export function extractActions(openActionCalls: unknown): Action[] {
    if (!openActionCalls || typeof openActionCalls !== "object") {
        return [];
    }

    const storedActions = Object.values(openActionCalls).map(call => ({
        name: call.Name,
        arguments: call.Arguments,
        toolId: call.ToolId
    }))

    return formatActions(storedActions);
}

export function formatActions(storedActions: StoredAction[]): Action[] {
    const actions: Action[] = [];

    storedActions.forEach(call => {
        const parsedArguments = parseArguments(call.name, call.arguments);
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

function parseArguments(actionName: Action["name"], argumentsString: string) {
    const parser = schemas[actionName];
    if (!parser) {
        console.warn(`No parser defined for action: ${actionName}`);
        return null;
    }

    try {
        const jsonArguments = JSON.parse(argumentsString);
        return parser.parse(jsonArguments);
    } catch (err) {
        console.warn(`Failed to parse arguments for action ${actionName}:`, err);
        return null;
    }
}