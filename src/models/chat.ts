export type Chat = {
    id: string,
    updatedAt: string,
    title: string
}

export type Message = {
    id: string,
    role: "user" | "assistant" | "tool",
    content: string
}