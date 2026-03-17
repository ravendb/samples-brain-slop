import { loadChatMessages, sendMessage } from "@/repositories/chatRepo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const chatId = request.nextUrl.searchParams.get("chatId");

    if (!chatId) {
        return NextResponse.json({ error: "Missing chatId query parameter." }, { status: 400 });
    }

    try {
        const messages = await loadChatMessages(chatId);
        return NextResponse.json(messages);
    } catch {
        return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { chatId, content } = await request.json();

    const response = await sendMessage(chatId, content);

    return new Response(response, { status: 200 });
}
