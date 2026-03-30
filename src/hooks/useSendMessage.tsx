"use client";

import { useMutation } from "@tanstack/react-query";

type SendMessageArgs = {
    chatId: string;
    content: string;
};

export function useSendMessage() {
    return useMutation(async ({ chatId, content }: SendMessageArgs) => {
        const res = await fetch("/api/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId, content }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || res.statusText);
        }

        return (await res.json()) as { reply: string | null; chatId: string | null; actions: any[] };
    });
}
