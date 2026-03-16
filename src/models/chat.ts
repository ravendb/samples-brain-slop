export type Chat = {
    id: string,
    updatedAt: string,
    title: string
}

export type ChatDocument = {
    messages: Message[]
}

type Message = UserMessage | AssistantMessage | SystemMessage;

export type ChatMessage = {
    role: "user" | "assistant";
    content: string;
    date: string;
}

type UserMessage = {
    role: "user";
    content: string;
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