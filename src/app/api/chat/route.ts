import { loadChats } from "@/repositories/chatRepo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const memberId = request.nextUrl.searchParams.get("memberId");
    if (!memberId) {
        return NextResponse.json({ error: "memberId is required." }, { status: 400 });
    }

    try {
        const chats = await loadChats(memberId);
        return NextResponse.json(chats);
    } catch {
        return NextResponse.json({ error: "Could not load chats." }, { status: 500 });
    }
}
