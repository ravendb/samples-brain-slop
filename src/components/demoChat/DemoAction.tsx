"use client";

import { Action } from "@/models/action";
import ActionCard from "@/components/actions/Action";
import styles from "@/components/actionPager/ActionPager.module.css";
import { DemoActionStep } from "./DemoChat";

type DemoActionProps = {
    action: DemoActionStep;
    onApprove: () => void;
    isPending: boolean;
};

export default function DemoAction({ action, onApprove, isPending }: DemoActionProps) {
    const fakeAction: Action = {
        name: action.type as Action["name"],
        arguments: action.args as Action["arguments"],
        id: "demo",
    };

    return (
        <section className={styles.container} aria-label="Suggested action">
            <div className={styles.header}>
                <p className={styles.title}>Suggested action</p>
            </div>

            <ActionCard action={fakeAction} />

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.approve}
                    onClick={onApprove}
                    disabled={isPending}
                >
                    {isPending ? (
                        <span className={styles.spinner} aria-label="Approving..." />
                    ) : "Approve"}
                </button>
            </div>
        </section>
    );
}
