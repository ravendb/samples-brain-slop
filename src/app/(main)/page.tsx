import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Brain Slop</h1>
                <p className={styles.description}>
                    Turn messy thoughts into actionable tasks — automatically.
                    <br />
                    Start a new chat to get going.
                </p>
                <Link href="/chat/new" className={styles.newChatButton}>
                    New chat
                </Link>
            </div>
        </div>
    );
}
