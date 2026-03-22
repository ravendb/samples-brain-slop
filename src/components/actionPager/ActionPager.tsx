"use client";

import { useEffect, useState } from "react";
import { Action, ActionResult } from "@/models/action";
import ActionCard from "@/components/action/Action";

type ActionDecision = "approve" | "reject";
import styles from "./ActionPager.module.css";

type ActionPagerProps = {
    actions: Action[];
    chatId: string;
    onActionDecision: (toolResponse: string, agentResponse: string | null, openActions: Action[]) => void;
};

export default function ActionPager({ actions, chatId, onActionDecision }: ActionPagerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
    }, [actions]);

    if (actions.length === 0) {
        return null;
    }

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === actions.length - 1;

    function showPrevious() {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    }

    function showNext() {
        setCurrentIndex(prev => Math.min(actions.length - 1, prev + 1));
    }

    async function handleActionDecision(action: Action, decision: ActionDecision) {
        const endpoint = `/api/actions/${decision}`;
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chatId, action }),
            });

            console.log("Action decision failed:", response);

            if (!response.ok) {
                throw new Error("Action failed");
            }
            const result = await response.json() as ActionResult;
            console.log("Action decision result:", result);
            onActionDecision(result.toolResponse, result.agentResponse, result.openActions);
        } catch (err) {
            console.error("Error handling action decision:", err);
        }
    }

    return (
        <section className={styles.container} aria-label="Action pager">
            <div className={styles.header}>
                <p className={styles.title}>Suggested actions</p>
                <div className={styles.headerRight}>
                    <p className={styles.counter}>{currentIndex + 1} of {actions.length}</p>
                    <div className={styles.navButtons}>
                        <button type="button" onClick={showPrevious} disabled={isFirst} className={styles.button}>
                            Previous
                        </button>
                        <button type="button" onClick={showNext} disabled={isLast} className={styles.button}>
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
                >
                    Approve
                </button>
                <button
                    type="button"
                    className={styles.reject}
                    onClick={() => handleActionDecision(actions[currentIndex], "reject")}
                >
                    Reject
                </button>
            </div>
        </section>
    );
}
