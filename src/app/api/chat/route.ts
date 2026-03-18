import { loadChats } from "@/repositories/chatRepo";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const chats = await loadChats();
        return NextResponse.json(chats);
    } catch {
        return NextResponse.json({ error: "Could not load chats." }, { status: 500 });
    }
}
