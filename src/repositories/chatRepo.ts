import { store } from "@/db/ravendb";
import { Chat, ChatDocument, ChatMessage } from "@/models/chat";

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

export async function loadChatMessages(chatId: string): Promise<ChatMessage[]> {
    const session = store.openSession();

    const chat = await session.advanced.rawQuery<ChatDocument>(`
            from @conversations
            where id() = $chatId
            select Messages as messages
        `)
        .addParameter("chatId", chatId)
        .first();

    return chat.messages
        .filter(message => message.role !== "system")
        .map(message => ({
            role: message.role,
            content: message.role === "assistant" ? message.content.response : message.content,
            date: message.date
        }));
}