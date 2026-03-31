"use client";

import { Message, SendMessageResult } from "@/models/chat";
import { Action } from "@/models/action";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MessageInput from "@/components/messageInput/MessageInput";
import ActionPager from "@/components/actionPager/ActionPager";
import ChatMessage from "./ChatMessage";
import styles from "./ChatMessages.module.css";
import { useRouter } from "next/navigation";
import { decodeStream } from "@/services/stream";

type ChatMessagesProps = {
    chatId: string;
    initialMessages: Message[];
    initialActions: Action[];
    isNewChat: boolean;
};

async function sendMessage(
    chatId: string,
    content: string,
    onChunk: (chunk: string) => void,
    onFinalResult: (result: SendMessageResult) => void
) {
    const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, content }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Failed to send message: ${response.status}`);
    }

    const reader = response.body.getReader();
    await decodeStream(reader, onChunk, onFinalResult);
}

export default function ChatMessages({ chatId, initialMessages, initialActions, isNewChat }: ChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [actions, setActions] = useState<Action[]>(initialActions);
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const isCentered = isNewChat && messages.length === 0;

    useEffect(() => {
        setMessages(initialMessages);
        setActions(initialActions);
        setCurrentChatId(chatId);
    }, [initialMessages, initialActions, chatId]);

    // Auto-scroll container to show new messages or actions
    useEffect(() => {
        if (!scrollAreaRef.current) return;
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }, [messages]);

    function sendMessageMutation(content: string) {
        setError(null);
        addUserMessage(content);

        const id = crypto.randomUUID();
        setMessages(prev => [...prev,
        {
            id,
            role: "assistant",
            chunks: [],
            type: "chunks"
        },
        ]);

        setIsPending(true);
        try {
            sendMessage(currentChatId, content, (chunk) => onChunk(chunk, id), onFinalResult)
        } catch (err) {
            setError(err as Error);
            setIsPending(false);
        }
    }

    function onChunk(chunk: string, streamedMessageId: string) {
        setIsPending(false);
        setMessages(prev => prev.map(msg => {
            if (msg.id === streamedMessageId && msg.chunks) {
                return {
                    ...msg,
                    chunks: [...msg.chunks, chunk]
                }
            }
            else {
                return msg
            }
        }))
    }

    function onFinalResult(result: SendMessageResult) {
        setIsPending(false);
        setActions(result.actions);

        if (isNewChat && result.chatId && result.chatId !== currentChatId) {
            setCurrentChatId(result.chatId);
            router.replace(`/chat/${encodeURIComponent(result.chatId)}`);

            queryClient.invalidateQueries({ queryKey: ["chats"] });

            setTimeout(
                () => { queryClient.invalidateQueries({ queryKey: ["chats"] }); },
                1000 * 30 // 30 seconds
            );
        }
    }

    function onActionDecision(toolResponse: string, agentResponse: string | null, openActions: Action[]) {
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: "tool",
                content: toolResponse,
            },
        ]);

        if (agentResponse) {
            addAgentMessage(agentResponse);
        }

        setActions(openActions);
    }

    function addUserMessage(content: string) {
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: "user",
                content: content,
            },
        ]);
    }

    function addAgentMessage(reply: string) {
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: "assistant",
                content: reply,
            },
        ]);
    }

    return (
        <div className={`${styles.page} ${isCentered ? styles.pageCentered : ""}`}>
            <div className={styles.scrollArea} ref={scrollAreaRef}>
                {messages.length === 0 && !isCentered && <p className={styles.subtle}>No messages yet.</p>}
                {messages.length > 0 && (
                    <ul className={styles.messageList}>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        {isPending ? (
                            <li className={styles.message} data-role="assistant" data-pending="true">
                                <p className={styles.content}>Thinking...</p>
                            </li>
                        ) : null}
                        {actions.length > 0 && (
                            <li className={styles.actionItem}>
                                <ActionPager actions={actions} chatId={currentChatId} onActionDecision={onActionDecision} />
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {error !== null && <p className={`${styles.subtle} ${styles.error}`}>{error.message}</p>}

            <MessageInput onSend={sendMessageMutation} disabled={isPending || actions.length > 0} />
        </div>
    );
}