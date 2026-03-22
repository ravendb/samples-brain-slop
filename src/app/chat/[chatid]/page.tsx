import { loadChat } from "@/repositories/chatRepo";
import styles from "./page.module.css";
import ChatMessages from "@/components/chatMessages/ChatMessages";

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

	let messages = [];
	let actions = [];
	try {
		const chat = await loadChat(decodedChatId);
		messages = chat.messages;
		actions = chat.actions ? chat.actions : [];
	} catch {
		return renderError("Could not load this conversation.");
	}

	return (
		<div className={styles.page}>
			<ChatMessages
				chatId={decodedChatId}
				initialMessages={messages}
				initialActions={actions}
				isNewChat={false}
			/>
		</div>
	);
}
