"use client";

import { Message, SendMessageResult } from "@/models/chat";
import { Action } from "@/models/action";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MessageInput from "@/components/messageInput/MessageInput";
import ActionPager from "@/components/actionPager/ActionPager";
import ChatMessage from "./ChatMessage";
import ChatError from "./ChatError";
import styles from "./ChatMessages.module.css";
import { useRouter } from "next/navigation";
import { decodeStream } from "@/services/stream";

type ChatMessagesProps = {
    chatId: string;
    initialMessages: Message[];
    initialActions: Action[];
    isNewChat: boolean;
    initialPrompt?: string;
    demoScript?: string[];
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

export default function ChatMessages({ chatId, initialMessages, initialActions, isNewChat, initialPrompt, demoScript }: ChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [actions, setActions] = useState<Action[]>(initialActions);
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [demoIndex, setDemoIndex] = useState(1);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const hasSentInitialPrompt = useRef(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const isCentered = isNewChat && messages.length === 0;

    const [prevChatId, setPrevChatId] = useState(chatId);
    if (chatId !== prevChatId) {
        setMessages(initialMessages);
        setActions(initialActions);
        setCurrentChatId(chatId);
        setPrevChatId(chatId);
    }

    // Auto-scroll container to show new messages or actions
    useEffect(() => {
        if (!scrollAreaRef.current) return;
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }, [messages, actions]);

    // Auto-send initialPrompt (from suggestion chips on the home page)
    useEffect(() => {
        if (!initialPrompt || hasSentInitialPrompt.current) return;
        hasSentInitialPrompt.current = true;
        sendMessageMutation(initialPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-send first demo message on mount
    useEffect(() => {
        if (!demoScript || hasSentInitialPrompt.current) return;
        hasSentInitialPrompt.current = true;
        sendMessageMutation(demoScript[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function sendMessageMutation(content: string, isDemoMessage = false) {
        setError(null);
        addUserMessage(content);
        if (isDemoMessage) setDemoIndex(prev => prev + 1);

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
            await sendMessage(currentChatId, content, (chunk) => onChunk(chunk, id), onFinalResult)
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

            if (!demoScript) {
                router.replace(`/chat/${encodeURIComponent(result.chatId)}`);
            }

            queryClient.invalidateQueries({ queryKey: ["chats"] });

            setTimeout(
                () => { queryClient.invalidateQueries({ queryKey: ["chats"] }); },
                1000 * 30 // 30 seconds
            );
        }
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
                                <p className={styles.content}>
                                    Thinking
                                    <span className={styles.ellipsis} aria-label="thinking">
                                        <span>.</span>
                                        <span>.</span>
                                        <span>.</span>
                                    </span>
                                </p>
                            </li>
                        ) : null}
                        {actions.length > 0 && (
                            <li className={styles.actionItem}>
                                <ActionPager actions={actions} chatId={currentChatId} setActions={setActions} setMessages={setMessages} />
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {error !== null && <ChatError error={error} />}

            <MessageInput
                onSend={demoScript && demoIndex < demoScript.length
                    ? (content) => sendMessageMutation(content, true)
                    : sendMessageMutation}
                disabled={isPending || actions.length > 0}
                lockedValue={demoScript && demoIndex < demoScript.length ? demoScript[demoIndex] : undefined}
            />
        </div>
    );
}