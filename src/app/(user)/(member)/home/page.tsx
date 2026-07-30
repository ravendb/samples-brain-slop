"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./page.module.css";
import glow from "@/styles/glow.module.css";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const SUGGESTIONS = [
    { label: "Turn an idea into a project", href: "/demo/0" },
    { label: "Break down a goal into tasks", href: "/demo/1" },
    { label: "Turn meeting notes into tasks", href: "/demo/2" },
];

export default function Home() {
    const queryClient = useQueryClient();
    const { data: onboardingCompleted } = useOnboardingStatus();
    const showGlow = onboardingCompleted === false;

    function handleDemoClick() {
        fetch("/api/onboarding", { method: "POST", keepalive: true }).catch(() => {});
        queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>BrainSlop</h1>
                <p className={styles.description}>
                    Turn messy thoughts into actionable tasks — automatically.
                </p>
                <p className={styles.prompt}>What is on your mind?</p>
                <div className={styles.suggestions}>
                    {SUGGESTIONS.map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            onClick={handleDemoClick}
                            className={showGlow ? `${styles.suggestion} ${glow.glow}` : styles.suggestion}
                        >
                            {s.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
