import { AiAnswer } from "ravendb"
import { store } from "@/db/ravendb";
import { Chat, Message } from "@/models/chat";
import { CreateProjectArgumentntsSchema, Action } from "@/models/action";

const AGENT_ID = "assistant";

export async function loadChats(): Promise<Chat[]> {
    const session = store.openSession();

    const chats = await session.advanced.rawQuery<Chat>(`
            from @conversations
            select id() as id, Title as title, LastMessageAt as updatedAt
        `)
        .all();

    return chats.map(chat => ({
        id: chat.id,
        title: chat.title?.trim() ? chat.title : "New chat",
        updatedAt: formatUpdatedAt(chat.updatedAt)
    }));
}

export async function deleteChat(chatId: string) {
    const session = store.openSession();
    session.delete(chatId);
    await session.saveChanges();
}

export async function sendMessage(chatId: string, content: string) {
    const chat = store.ai.conversation(
        AGENT_ID,
        chatId
    )

    chat.setUserPrompt(content)

    const llmResponse: AgentResponse = await chat.run()
    console.log("LLM response:", llmResponse);

    return {
        chatId: chat.id,
        reply: llmResponse.answer?.response ?? null,
    };
}

export async function loadChat(chatId: string) {
    const session = store.openSession();

    const chat = await session.advanced.rawQuery<ChatDocument>(`
            from @conversations
            where id() = $chatId
            select Messages as messages, OpenActionCalls as openActionCalls
        `)
        .addParameter("chatId", chatId)
        .first();

    return {
        messages: formatMessages(chat.messages),
        actions: extractActions(chat.openActionCalls)
    };
}

function extractActions(openActionCalls: unknown): Action[] {
    if (!openActionCalls || typeof openActionCalls !== "object") {
        return [];
    }

    const actionCalls: StoredAction[] = Object.values(openActionCalls) as StoredAction[];
    const actions: Action[] = [];

    actionCalls.forEach(call => {
        try {
            const jsonArguments = JSON.parse(call.Arguments);
            const parsedArguments = CreateProjectArgumentntsSchema.parse(jsonArguments);
            actions.push({
                name: call.Name,
                arguments: parsedArguments,
                id: call.ToolId
            });
        } catch {
            // Ignore parsing errors - the call might not be related to CreateProjectAction
        }
    });

    return actions;
}

function formatMessages(storedMessages: StoredMessage[]): Message[] {
    const uiMessages: Message[] = [];

    storedMessages
        .filter(m => m.role !== "system")
        .forEach((m, index) => {
            const content = extractContent(m);
            if (content) {
                uiMessages.push({
                    id: index.toString(),
                    role: m.role,
                    content
                });
            }
        });
        
    return uiMessages;
}

function extractContent(message: Exclude<StoredMessage, SystemMessage>) {
    if (message.role === "assistant") {
        return message.content?.response ?? null;
    }
    else {
        if (typeof message.content === "string") {
            return message.content;
        }
        else {
            let normalizedContent = '';
            for (const part of message.content) {
                if (part.type === "text") {
                    normalizedContent += part.text;
                }
            }
            return normalizedContent;
        }
    }
}

function formatUpdatedAt(updatedAt: string): string {
	const parsed = new Date(updatedAt);

	if (Number.isNaN(parsed.getTime())) {
		return updatedAt;
	}

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(parsed);
}

type ChatDocument = {
    messages: StoredMessage[];
    openActionCalls: unknown;
}

type StoredAction = {
    Name: string;
    Arguments: string;
    ToolId: string;
}

type StoredMessage = UserMessage | AssistantMessage | SystemMessage | ToolMessage;

type UserMessage = {
    role: "user";
    content: string | ({ type: string; text: string })[];
    date: string;
};

type AssistantMessage = {
    role: "assistant";
    content: { response: string } | null;
    date: string;
};

type SystemMessage = {
    role: "system";
    content: string;
    date: string;
};

type ToolMessage = {
    role: "tool";
    content: string;
    date: string;
}

export type AgentResponse = AiAnswer<{ response: string }>