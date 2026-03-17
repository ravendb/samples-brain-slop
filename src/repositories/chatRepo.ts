import { store } from "@/db/ravendb";
import { Chat, ChatDocument, AgentResponse, Message } from "@/models/chat";
import { format } from "path";

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
        title: chat.title,
        updatedAt: formatUpdatedAt(chat.updatedAt)
    }));
}

export async function sendMessage(chatId: string, content: string) {
    const chat = store.ai.conversation(
        AGENT_ID,
        chatId
    )

    chat.setUserPrompt(content)

    const llmResponse: AgentResponse = await chat.run()
    console.log("LLM response:", llmResponse);

    return llmResponse.answer?.response;
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

function formatMessages(messages: Message[]) {
    return messages
        .filter(message => message.role !== "system")
        .map(message => {
            let normalizedContent: string;

            if (message.role === "assistant") {
                normalizedContent = message.content.response;
            }
            else {
                if (typeof message.content === "string") {
                    normalizedContent = message.content;
                }
                else {
                    normalizedContent = '';
                    for (const part of message.content) {
                        if (part.type === "text") {
                            normalizedContent += part.text;
                        }
                    }
                }
            }

            return {
                role: message.role,
                content: normalizedContent
            };
        })
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