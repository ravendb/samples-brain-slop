import { loadChatMessages } from "@/repositories/chatRepo";
import { ChatMessage } from "@/models/chat";
import styles from "./page.module.css";
import MessageInput from "@/components/messageInput/MessageInput";

type ChatPageProps = {
	params: Promise<{ chatid: string }>;
};

function decodeChatId(encodedChatId: string): string {
	return decodeURIComponent(encodedChatId);
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatid } = await params;

	let decodedChatId: string;
	try {
		decodedChatId = decodeChatId(chatid);
	} catch {
		return (
			<div className={styles.page}>
				<h1 className={styles.title}>Chat</h1>
				<p className={`${styles.subtle} ${styles.error}`}>
					Could not load this conversation: invalid chat id.
				</p>
			</div>
		);
	}

	let messages: ChatMessage[];
	try {
		messages = await loadChatMessages(decodedChatId);
	} catch (error) {
        console.error("Error loading chat messages:", error);
		return (
			<div className={styles.page}>
				<h1 className={styles.title}>Chat</h1>
				<p className={`${styles.subtle} ${styles.error}`}>
					Could not load this conversation.
				</p>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			{messages.length === 0 ? (
				<p className={styles.subtle}>No messages yet.</p>
			) : (
				<ul className={styles.messageList}>
					{messages.map((message, index) => (
						<li key={`${message.date}-${index}`} className={styles.message} data-role={message.role}>
							<p className={styles.content}>{message.content}</p>
						</li>
					))}
				</ul>
			)}
			<MessageInput />
		</div>
	);
}
