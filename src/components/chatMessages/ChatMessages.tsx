"use client";

import { Message } from "@/models/chat";
import { useEffect, useRef, useState } from "react";
import MessageInput from "@/components/messageInput/MessageInput";
import styles from "./ChatMessages.module.css";

type ChatMessagesProps = {
    chatId: string;
    initialMessages: Message[];
};

async function sendMessage(chatId: string, content: string): Promise<string | null> {
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

    const reply = (await response.text()).trim();

    if (!reply || reply === "undefined") {
        return null;
    }

    return reply;
}

export default function ChatMessages({ chatId, initialMessages }: ChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
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
        const optimisticMessage: Message = {
            id: messages.length.toString(),
            role: "user",
            content,
        };
        setMessages(prev => [...prev, optimisticMessage]);
    }

    function addAgentMessage(reply: string) {
        setMessages(prev => [
            ...prev,
            {
                id: (messages.length + 1).toString(),
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
            const reply = await sendMessage(chatId, content);
            if (reply) addAgentMessage(reply);
        } catch {
            setError("Could not send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className={styles.page}>
            {messages.length === 0 && <p className={styles.subtle}>No messages yet.</p>}
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