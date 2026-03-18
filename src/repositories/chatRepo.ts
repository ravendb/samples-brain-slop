import { AiAnswer } from "ravendb"
import { store } from "@/db/ravendb";
import { Chat, Message } from "@/models/chat";

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

export async function loadChatMessages(chatId: string) {
    const session = store.openSession();

    const chat = await session.advanced.rawQuery<ChatDocument>(`
            from @conversations
            where id() = $chatId
            select Messages as messages
        `)
        .addParameter("chatId", chatId)
        .first();

    return formatMessages(chat.messages);
}

function formatMessages(messages: StoredMessage[]): Message[] {
    return messages
        .filter(message => message.role !== "system")
        .map((message, index) => ({
            id: index.toString(),
            role: message.role,
            content: normalizeContent(message),
        }));
}

function normalizeContent(message: AssistantMessage | UserMessage) {
    if (message.role === "assistant") {
        return message.content.response;
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
    messages: StoredMessage[]
}

type StoredMessage = UserMessage | AssistantMessage | SystemMessage;

type UserMessage = {
    role: "user";
    content: string | ({ type: string; text: string })[];
    date: string;
};

type AssistantMessage = {
    role: "assistant";
    content: { response: string };
    date: string;
};

type SystemMessage = {
    role: "system";
    content: string;
    date: string;
};

export type AgentResponse = AiAnswer<{ response: string }>