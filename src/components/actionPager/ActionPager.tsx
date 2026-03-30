"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Action, ActionResult } from "@/models/action";
import ActionCard from "@/components/actions/Action";
import styles from "./ActionPager.module.css";

type ActionDecision = "approve" | "reject";

type ActionPagerProps = {
    actions: Action[];
    chatId: string;
    onActionDecision: (toolResponse: string, agentResponse: string | null, openActions: Action[]) => void;
};

async function sendActionDecision(chatId: string, action: Action, decision: ActionDecision) {
    const response = await fetch(`/api/actions/${decision}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, action }),
    });

    if (!response.ok) {
        throw new Error(`Action ${action.id} failed. Status: ${response.status}`);
    }

    return await response.json() as ActionResult;
}

export default function ActionPager({ actions, chatId, onActionDecision }: ActionPagerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [decision, setDecision] = useState<ActionDecision | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentIndex(0);
    }, [actions]);

    if (actions.length === 0) {
        return null;
    }

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === actions.length - 1;
    const pagerLocked = decision !== null;


    function showPrevious() {
        if (!pagerLocked) setCurrentIndex(prev => Math.max(0, prev - 1));
    }

    function showNext() {
        if (!pagerLocked) setCurrentIndex(prev => Math.min(actions.length - 1, prev + 1));
    }

    async function handleActionDecision(action: Action, decision: ActionDecision) {
        setDecision(decision);

        try {
            const result = await sendActionDecision(chatId, action, decision);
            console.log("Action decision result:", result);
            onActionDecision(result.toolResponse, result.agentResponse, result.openActions);
            
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["task"] });
        } catch (err) {
            console.error("Error handling action decision:", err);
        } finally {
            setDecision(null);
        }
    }

    return (
        <section className={styles.container} aria-label="Action pager">
            <div className={styles.header}>
                <p className={styles.title}>Suggested actions</p>
                <div className={styles.headerRight}>
                    <p className={styles.counter}>{currentIndex + 1} of {actions.length}</p>
                    <div className={styles.navButtons}>
                        <button type="button" onClick={showPrevious} disabled={isFirst || pagerLocked} className={styles.button}>
                            Previous
                        </button>
                        <button type="button" onClick={showNext} disabled={isLast || pagerLocked} className={styles.button}>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <ActionCard action={actions[currentIndex]} />

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.approve}
                    onClick={() => handleActionDecision(actions[currentIndex], "approve")}
                    disabled={pagerLocked}
                >
                    {decision === "approve" ? (
                        <span className={styles.spinner} aria-label="Approving..." />
                    ) : "Approve"}
                </button>
                <button
                    type="button"
                    className={styles.reject}
                    onClick={() => handleActionDecision(actions[currentIndex], "reject")}
                    disabled={pagerLocked}
                >
                    {decision === "reject" ? (
                        <span className={styles.spinner} aria-label="Rejecting..." />
                    ) : "Reject"}
                </button>
            </div>
        </section>
    );
}
