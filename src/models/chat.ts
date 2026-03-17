import { AiAnswer } from "ravendb"

export type AgentResponse = AiAnswer<{ response: string }>

export type Chat = {
    id: string,
    updatedAt: string,
    title: string
}

export type ChatDocument = {
    messages: Message[]
}

export type Message = UserMessage | AssistantMessage | SystemMessage;

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