import { notFound } from "next/navigation";
import demos from "@/data/demos.json";
import ChatMessages from "@/components/chatMessages/ChatMessages";

export default async function DemoPage({ params }: { params: Promise<{ index: string }> }) {
    const { index } = await params;
    const demo = demos[Number(index)];
    // if (!demo) notFound();

    return (
        <ChatMessages
            chatId="Chats/"
            initialMessages={[]}
            initialActions={[]}
            isNewChat={true}
            demoScript={demo.messages}
        />
    );
}
