import { NextResponse } from "next/server";
import { rejectAction } from "@/services/actions";
import { Action } from "@/models/action";
import { encodeStream } from "@/services/stream";

export async function POST(request: Request) {
    const { chatId, action } = await request.json() as { chatId: string; action: Action };

    if (!chatId || !action) {
        return NextResponse.json({ error: "Missing chatId or action." }, { status: 400 });
    }

    const stream = encodeStream((onChunk) => rejectAction(chatId, action, onChunk));
    
    return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
