import Link from "next/link";
import styles from "./page.module.css";

const SUGGESTIONS = [
    { label: "Turn an idea into a project", href: "/demo/0" },
    { label: "Break down a goal into tasks", href: "/demo/1" },
    { label: "Turn meeting notes into tasks", href: "/demo/2" },
];

export default function Home() {
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
                            className={styles.suggestion}
                        >
                            {s.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
