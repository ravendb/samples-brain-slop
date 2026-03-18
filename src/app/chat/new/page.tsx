import ChatMessages from "@/components/chatMessages/ChatMessages";
import styles from "@/app/chat/[chatid]/page.module.css";

export default function NewChatPage() {
	return (
		<div className={styles.page}>
			<ChatMessages chatId="Chats/" initialMessages={[]} isNewChat={true} />
		</div>
	);
}
