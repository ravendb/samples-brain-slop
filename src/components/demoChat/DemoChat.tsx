"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import DemoAction from "./DemoAction";
import chatStyles from "@/components/chatMessages/ChatMessages.module.css";
import inputStyles from "@/components/messageInput/MessageInput.module.css";
import styles from "./DemoChat.module.css";

export type DemoActionStep = {
    type: string;
    label: string;
    args: Record<string, unknown>;
    actionResponse?: string;
};

export type DemoStep = {
    userMessage: string;
    aiResponse: string;
    action?: DemoActionStep;
};

type DemoMessage = {
    role: "user" | "assistant";
    content: string;
};

type Phase = "sending" | "thinking" | "streaming" | "action" | "done";

export default function DemoChat({ steps }: { steps: DemoStep[] }) {
    const [messages, setMessages] = useState<DemoMessage[]>([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("thinking");
    const [isPending, setIsPending] = useState(false);
    const [demoContext, setDemoContext] = useState<{ projectId?: string; taskIds?: string[] }>({});
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lockedInputRef = useRef<HTMLTextAreaElement>(null);
    const queryClient = useQueryClient();

    function resolveArgs(args: Record<string, unknown>): Record<string, unknown> {
        const str = JSON.stringify(args)
            .replace(/"{{projectId}}"/g, JSON.stringify(demoContext.projectId ?? ""))
            .replace(/"{{taskIds\.(\d+)}}"/g, (_, i) => JSON.stringify(demoContext.taskIds?.[parseInt(i, 10)] ?? ""));
        return JSON.parse(str) as Record<string, unknown>;
    }

    useEffect(() => {
        if (!scrollAreaRef.current) return;
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }, [messages, phase]);

    useEffect(() => {
        const el = lockedInputRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [stepIndex, phase]);

    const hasAutoSent = useRef(false);
    useEffect(() => {
        if (hasAutoSent.current) return;
        hasAutoSent.current = true;
        void handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSend() {
        const step = steps[stepIndex];
        setMessages(prev => [...prev, { role: "user", content: step.userMessage }]);
        setPhase("thinking");

        await new Promise(resolve => setTimeout(resolve, 700));

        await streamWords(step.aiResponse);

        if (step.action) {
            setPhase("action");
        } else {
            advance();
        }
    }

    function advance() {
        setStepIndex(prev => {
            const next = prev + 1;
            setPhase(next < steps.length ? "sending" : "done");
            return next < steps.length ? next : prev;
        });
    }

    async function streamWords(text: string, appendToLast = false) {
        if (!appendToLast) {
            setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        }
        setPhase("streaming");
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const skipSpace = i === 0 && appendToLast;
            await new Promise(resolve => setTimeout(resolve, 38));
            setMessages(prev => {
                const last = prev[prev.length - 1];
                return [
                    ...prev.slice(0, -1),
                    { ...last, content: (last.content === "" || skipSpace) ? last.content + word : last.content + " " + word },
                ];
            });
        }
    }

    async function handleApprove() {
        const step = steps[stepIndex];
        if (!step.action) return;

        setIsPending(true);
        try {
            const resolvedArgs = resolveArgs(step.action.args);
            const response = await fetch("/api/demo/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: step.action.type, args: resolvedArgs }),
            });
            if (!response.ok) throw new Error("Demo action failed");

            const data = await response.json() as { projectId?: string; taskIds?: string[] };
            if (data.projectId) setDemoContext({ projectId: data.projectId, taskIds: data.taskIds });

            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["task"] });
        } catch (err) {
            console.error("Demo action failed:", err);
            setIsPending(false);
            return;
        }

        setIsPending(false);

        if (step.action.actionResponse) {
            setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...last, content: last.content + "\n" }];
            });
            await streamWords(step.action.actionResponse, true);
        }

        advance();
    }

    return (
        <div className={chatStyles.page}>
            <div className={chatStyles.scrollArea} ref={scrollAreaRef}>
                <ul className={chatStyles.messageList}>
                    {messages.map((msg, i) => (
                        <li key={i} className={chatStyles.message} data-role={msg.role}>
                            <p className={chatStyles.content}>{msg.content}</p>
                        </li>
                    ))}

                    {phase === "thinking" && (
                        <li className={chatStyles.message} data-role="assistant" data-pending="true">
                            <p className={chatStyles.content}>
                                Thinking
                                <span className={chatStyles.ellipsis} aria-label="thinking">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            </p>
                        </li>
                    )}

                    {phase === "action" && steps[stepIndex].action && (
                        <li className={chatStyles.actionItem}>
                            <DemoAction
                                action={steps[stepIndex].action!}
                                onApprove={handleApprove}
                                isPending={isPending}
                            />
                        </li>
                    )}
                </ul>
            </div>

            {phase === "sending" && (
                <div className={inputStyles.inputRow}>
                    <textarea
                        ref={lockedInputRef}
                        className={inputStyles.input}
                        rows={1}
                        readOnly
                        value={steps[stepIndex].userMessage}
                    />
                    <button
                        className={inputStyles.sendButton}
                        type="button"
                        onClick={() => void handleSend()}
                    >
                        Send
                    </button>
                </div>
            )}

            {phase === "done" && (
                <p className={styles.doneMessage}>
                    Demo complete —{" "}
                    <Link href="/chat/new" className={styles.doneLink}>start a new chat</Link>
                    {" "}to keep going.
                </p>
            )}
        </div>
    );
}
