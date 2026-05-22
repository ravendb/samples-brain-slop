import ChatMessages from "@/components/chatMessages/ChatMessages";
import styles from "@/app/(main)/chat/[chatid]/page.module.css";

export default async function NewChatPage({ searchParams }: { searchParams: Promise<{ prompt?: string }> }) {
    const { prompt } = await searchParams;
    return (
        <div className={styles.page}>
            <ChatMessages chatId="Chats/" initialMessages={[]} initialActions={[]} isNewChat={true} initialPrompt={prompt} />
        </div>
    );
}
