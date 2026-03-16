import styles from "./ConversationSidebar.module.css";
import { loadChats } from "@/repositories/chatRepo";
import ConversationList from "./ConversationList";


export default async function ConversationSidebar() {
	const chats = await loadChats();

	return (
		<aside className={styles.sidebar}>
			<h2 className={styles.title}>Your chats</h2>
			<ConversationList chats={chats} />
		</aside>
	);
}