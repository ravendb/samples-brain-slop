"use client";

import { Message } from "@/models/chat";
import { useEffect, useRef, useState } from "react";
import MessageInput from "@/components/messageInput/MessageInput";
import styles from "./ChatMessages.module.css";
import { useRouter } from "next/navigation";

type ChatMessagesProps = {
    chatId: string;
    initialMessages: Message[];
    isNewChat: boolean;
};

type SendMessageResult = {
    reply: string | null;
    chatId: string | null;
};

async function sendMessage(chatId: string, content: string): Promise<SendMessageResult> {
    const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
    }

    const payload = await response.json() as SendMessageResult;
    const reply = payload.reply?.trim();

    return {
        reply: reply ?? null,
        chatId: payload.chatId ?? null,
    };
}

export default function ChatMessages({ chatId, initialMessages, isNewChat }: ChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const router = useRouter();
    const isCentered = isNewChat && messages.length === 0;

    useEffect(() => {
        setMessages(initialMessages);
        setCurrentChatId(chatId);
        setError(null);
        setIsSending(false);
    }, [initialMessages, chatId]);

    // Auto-scroll to show new messages
    useEffect(() => {
        if (!listRef.current) {
            return;
        }
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, isSending]);

    function addUserMessage(content: string) {
        setMessages(prev => [
            ...prev,
            {
                id: prev.length.toString(),
                role: "user",
                content,
            },
        ]);
    }

    function addAgentMessage(reply: string) {
        setMessages(prev => [
            ...prev,
            {
                id: prev.length.toString(),
                role: "assistant",
                content: reply,
            },
        ]);
    }

    async function handleSend(content: string) {
        setError(null);

        addUserMessage(content);

        setIsSending(true);
        try {
            const result = await sendMessage(currentChatId, content);
            if (result.reply) {
                addAgentMessage(result.reply);
            }

            if (isNewChat && result.chatId && result.chatId !== currentChatId) {
                setCurrentChatId(result.chatId);
                router.replace(`/chat/${encodeURIComponent(result.chatId)}`);
            }
        } catch {
            setError("Could not send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className={`${styles.page} ${isCentered ? styles.pageCentered : ""}`}>
            {messages.length === 0 && !isCentered && <p className={styles.subtle}>No messages yet.</p>}
            {messages.length > 0 && (
                <ul className={styles.messageList} ref={listRef}>
                    {messages.map((message) => (
                        <li key={message.id} className={styles.message} data-role={message.role}>
                            <p className={styles.content}>{message.content}</p>
                        </li>
                    ))}
                    {isSending ? (
                        <li className={styles.message} data-role="assistant" data-pending="true">
                            <p className={styles.content}>Thinking...</p>
                        </li>
                    ) : null}
                </ul>
            )}

            {error ? <p className={`${styles.subtle} ${styles.error}`}>{error}</p> : null}

            <MessageInput onSend={handleSend} disabled={isSending} />
        </div>
    );
}