"use client";

import { Message } from "@/models/chat";
import { Action } from "@/models/action";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MessageInput from "@/components/messageInput/MessageInput";
import ActionPager from "@/components/actionPager/ActionPager";
import styles from "./ChatMessages.module.css";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type ChatMessagesProps = {
    chatId: string;
    initialMessages: Message[];
    initialActions: Action[];
    isNewChat: boolean;
};

type SendMessageResult = {
    reply: string | null;
    chatId: string | null;
    actions: Action[];
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

    return await response.json() as SendMessageResult;
}

export default function ChatMessages({ chatId, initialMessages, initialActions, isNewChat }: ChatMessagesProps) {
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [actions, setActions] = useState<Action[]>(initialActions);
    const [currentChatId, setCurrentChatId] = useState(chatId);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
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

    const { mutate: sendMessageMutation, isPending, error, isError } = useMutation({
        mutationFn: (content: string) => sendMessage(currentChatId, content),
        onMutate: (content: string) => {
            addUserMessage(content);
        },
        onSuccess: (result) => {
            if (result.reply) addAgentMessage(result.reply);
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
    });

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
                content,
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
                            <li key={message.id} className={styles.message} data-role={message.role}>
                                <p className={styles.content}>{message.content}</p>
                            </li>
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

            {isError && <p className={`${styles.subtle} ${styles.error}`}>{error.message}</p>}

            <MessageInput onSend={sendMessageMutation} disabled={isPending || actions.length > 0} />
        </div>
    );
}