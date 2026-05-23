import { loadChat, sendMessage } from "@/repositories/chatRepo";
import { NextRequest, NextResponse } from "next/server";
import { encodeStream } from "@/services/stream";

export async function GET(request: NextRequest) {
    const chatId = request.nextUrl.searchParams.get("chatId");

    if (!chatId) {
        return NextResponse.json({ error: "Missing chatId query parameter." }, { status: 400 });
    }

    try {
        const messages = await loadChat(chatId);
        return NextResponse.json(messages);
    } catch {
        return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { chatId, content, memberId } = await request.json();

    if (!chatId || !content || !memberId) {
        return NextResponse.json({ error: "Missing chatId, content, or memberId." }, { status: 400 });
    }

    const stream = encodeStream((onChunk) => sendMessage(chatId, content, onChunk, memberId));

    return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}