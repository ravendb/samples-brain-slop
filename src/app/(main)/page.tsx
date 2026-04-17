import Link from "next/link";
import styles from "./page.module.css";

const SUGGESTIONS = [
    "Turn an idea into a project",
    "Break down a goal into tasks",
    "Turn meeting notes into tasks",
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
                            key={s}
                            href={`/chat/new?prompt=${encodeURIComponent(s)}`}
                            className={styles.suggestion}
                        >
                            {s}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
