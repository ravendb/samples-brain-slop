import styles from "./LeftSidebar.module.css";
import ConversationList from "./ConversationList";
import Link from "next/link";

export default function ChatsPanel() {
    return (
        <div className={styles.chatsSection}>
            <div className={styles.header}>
                <h2 className={styles.title}>Your chats</h2>
                <Link href="/chat/new" className={styles.newChatLink}>New chat</Link>
            </div>
            <ConversationList />
        </div>
    );
}
