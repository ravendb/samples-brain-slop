import { Action } from "./action";

export const NEW_CHAT_ID = "Chats/";

export type Chat = {
    id: string,
    updatedAt: string,
    title: string,
    memberId: string
}

export type Message = {
    id: string,
    role: "user" | "assistant" | "tool",
    content?: string
    chunks?: string[],
}

export type SendMessageResult = {
    chatId: string | null;
    actions: Action[];
};