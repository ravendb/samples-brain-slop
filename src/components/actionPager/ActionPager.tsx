"use client";

import { useEffect, useState } from "react";
import { Action } from "@/models/action";
import ActionCard from "@/components/action/Action";
import styles from "./ActionPager.module.css";

type ActionPagerProps = {
    actions: Action[];
};

export default function ActionPager({ actions }: ActionPagerProps) {
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

    return (
        <section className={styles.container} aria-label="Action pager">
            <div className={styles.header}>
                <p className={styles.title}>Suggested actions</p>
                <p className={styles.counter}>{currentIndex + 1} of {actions.length}</p>
            </div>

            <ActionCard action={actions[currentIndex]} />

            <div className={styles.controls}>
                <button type="button" onClick={showPrevious} disabled={isFirst} className={styles.button}>
                    Previous
                </button>
                <button type="button" onClick={showNext} disabled={isLast} className={styles.button}>
                    Next
                </button>
            </div>
        </section>
    );
}
