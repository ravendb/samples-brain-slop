import { AiAnswer } from "ravendb"
import { store } from "@/db/ravendb";
import { Chat, Message } from "@/models/chat";
import { receiveActions } from "@/services/actions";
import { Action, ToolResponse } from "@/models/action";
import { extractActions, formatActions } from "@/repositories/actionRepo";
import { randomUUID } from "crypto";

const AGENT_ID = process.env.AGENT_ID || "assistant";

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

export async function sendMessage(chatId: string, prompt: string) {
    const chat = store.ai.conversation(
        AGENT_ID,
        chatId
    )

    chat.setUserPrompt(prompt)

    receiveActions(chat);

    const llmResponse: AgentResponse = await chat.run()
    console.log("LLM response:", llmResponse);

    let requiredActions: Action[] = [];
    if (llmResponse.status === 'ActionRequired') {
        requiredActions = formatActions(chat.requiredActions());
    }

    return {
        chatId: chat.id,
        reply: llmResponse.answer?.response ?? null,
        actions: requiredActions
    };
}

export async function sendToolMessage(chatId: string, toolResponse: ToolResponse) {
    const chat = store.ai.conversation(AGENT_ID, chatId);

    chat.addActionResponse(toolResponse.toolId, toolResponse.response);
    
    receiveActions(chat);

    const llmResponse: AgentResponse = await chat.run()
    console.log("LLM response after tool message:", llmResponse);

    let requiredActions: Action[] = [];
    if (llmResponse.status === 'ActionRequired') {
        requiredActions = formatActions(chat.requiredActions());
    }

    return {
        reply: llmResponse.answer?.response ?? null,
        actions: requiredActions
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

function formatMessages(storedMessages: StoredMessage[]): Message[] {
    const uiMessages: Message[] = [];

    storedMessages
        .filter(m => m.role !== "system")
        .forEach(m => {
            const content = extractContent(m);
            if (content) {
                uiMessages.push({
                    id: randomUUID(),
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