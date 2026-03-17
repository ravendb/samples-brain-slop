import { sendMessage } from "@/repositories/chatRepo";

export async function POST(request: Request) {
    const { chatId, content } = await request.json();
    
    const response = await sendMessage(chatId, content);

    return new Response(response, { status: 200 });
}