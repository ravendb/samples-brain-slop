import { loadChatMessages } from "@/repositories/chatRepo";
import styles from "./page.module.css";
import MessageInput from "@/components/messageInput/MessageInput";

type ChatPageProps = {
	params: Promise<{ chatid: string }>;
};

function decodeChatId(encodedChatId: string): string | null {
	try {
		return decodeURIComponent(encodedChatId);
	} catch {
		return null;
	}
}

function renderError(message: string) {
	return (
		<div className={styles.page}>
			<h1 className={styles.title}>Chat</h1>
			<p className={`${styles.subtle} ${styles.error}`}>{message}</p>
		</div>
	);
}

export default async function ChatPage({ params }: ChatPageProps) {
	const { chatid } = await params;

	const decodedChatId = decodeChatId(chatid);
	if (!decodedChatId) {
		return renderError("Could not load this conversation: invalid chat id.");
	}

	let messages;
	try {
		messages = await loadChatMessages(decodedChatId);
	} catch (error) {
		return renderError("Could not load this conversation.");
	}

	return (
		<div className={styles.page}>
			{messages.length === 0 ? (
				<p className={styles.subtle}>No messages yet.</p>
			) : (
				<ul className={styles.messageList}>
					{messages.map((message, index) => (
						<li key={index} className={styles.message} data-role={message.role}>
							<p className={styles.content}>{message.content}</p>
						</li>
					))}
				</ul>
			)}
			<MessageInput chatId={decodedChatId} />
		</div>
	);
}
