import { AiAnswer, AiConversation } from "ravendb"
import { getStore } from "@/db/ravendb";
import { getAgentId } from "@/lib/config";
import { Chat, Message } from "@/models/chat";
import { receiveActions } from "@/services/actions";
import { Action, StoredAction, ToolResponse } from "@/models/action";
import { extractActions, formatActions } from "@/repositories/actionRepo";
import { randomUUID } from "crypto";

export async function loadChats(): Promise<Chat[]> {
    const session = getStore().openSession();

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
    const session = getStore().openSession();
    session.delete(chatId);
    await session.saveChanges();
}

async function streamChat(chat: AiConversation, onChunk: (chunk: string) => void) {
    receiveActions(chat);

    const llmResponse: AgentResponse = await chat.stream("response", (chunk) => {
        onChunk(chunk);
    });

    let requiredActions: Action[] = [];
    if (llmResponse.status === 'ActionRequired') {
        requiredActions = formatActions(chat.requiredActions() as StoredAction[]);
    }

    return requiredActions
}

export async function sendMessage(chatId: string, prompt: string, onChunk: (chunk: string) => void) {
    const agentId = getAgentId();
    const chat = getStore().ai.conversation(agentId, chatId)

    chat.setUserPrompt(prompt)

    const actions = await streamChat(chat, onChunk);

    return {
        chatId: chat.id,
        actions
    };
}

export async function sendToolMessage(chatId: string, toolResponse: ToolResponse, onChunk: (chunk: string) => void) {
    const agentId = getAgentId();
    const chat = getStore().ai.conversation(agentId, chatId);

    chat.addActionResponse(toolResponse.toolId, toolResponse.response);

    return await streamChat(chat, onChunk);
}

export async function loadChat(chatId: string) {
    const session = getStore().openSession();

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
        .filter(m => m.role !== "system" && m.role !== "tool")
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