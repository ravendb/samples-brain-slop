import { loadChat, sendMessage } from "@/repositories/chatRepo";
import { NextRequest, NextResponse } from "next/server";

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
    const { chatId, content } = await request.json();

    if (!chatId || !content) {
        return NextResponse.json({ error: "Missing chatId or content." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const result = await sendMessage(chatId, content, (chunk) => {
                    const payload = JSON.stringify({ chunk });
                    controller.enqueue(encoder.encode(payload + "\n"));
                });

                const finalPayload = JSON.stringify(result);
                controller.enqueue(encoder.encode(finalPayload + "\n"));
                controller.close();
            } catch (err) {
                const errPayload = JSON.stringify({ error: "Failed to send message." });
                controller.enqueue(encoder.encode(errPayload + "\n"));
                controller.close();
            }
        }
    });

    return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
