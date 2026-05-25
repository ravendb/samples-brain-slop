import ChatMessages from "@/components/chatMessages/ChatMessages";
import styles from "@/app/(user)/(member)/chat/[chatid]/page.module.css";
import { NEW_CHAT_ID } from "@/models/chat";

export default async function NewChatPage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
    const { prompt } = await searchParams;
    return (
        <div className={styles.page}>
            <ChatMessages chatId={NEW_CHAT_ID} initialMessages={[]} initialActions={[]} isNewChat={true} initialPrompt={prompt} />
        </div>
    );
}
