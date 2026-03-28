import { Action, parsers, StoredAction } from "@/models/action";

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
    const parser = parsers[actionName];
    if (!parser) {
        throw new Error(`No parser defined for action: ${actionName}`);
    }

    try {
        const jsonArguments = JSON.parse(argumentsString);
        return parser.parse(jsonArguments);
    } catch {
        throw new Error(`Failed to parse arguments for action: ${actionName}`);
    }
}