import styles from "./ConversationSidebar.module.css";
import ConversationList from "./ConversationList";
import Link from "next/link";


export default function ConversationSidebar() {
	return (
		<aside className={styles.sidebar}>
			<div className={styles.header}>
				<h2 className={styles.title}>Your chats</h2>
				<Link href="/chat/new" className={styles.newChatLink}>New chat</Link>
			</div>
			<ConversationList />
		</aside>
	);
}