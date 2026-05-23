import ChatMessages from "@/components/chatMessages/ChatMessages";
import styles from "@/app/(main)/chat/[chatid]/page.module.css";
import { NEW_CHAT_ID } from "@/models/chat";

export default async function NewChatPage({ params, searchParams }: { params: Promise<{ memberId: string }>; searchParams: Promise<{ prompt?: string }> }) {
    const { memberId } = await params;
    const { prompt } = await searchParams;
    return (
        <div className={styles.page}>
            <ChatMessages chatId={NEW_CHAT_ID} memberId={memberId} initialMessages={[]} initialActions={[]} isNewChat={true} initialPrompt={prompt} />
        </div>
    );
}
