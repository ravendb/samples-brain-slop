import { deleteChat } from "@/repositories/chatRepo";
import { NextResponse, NextRequest } from "next/server";

type RouteContext = {
    params: Promise<{
        chatId?: string;
    }>;
};

function decodeChatId(encodedChatId: string) {
    try {
        return { chatId: decodeURIComponent(encodedChatId).trim(), valid: true };
    } catch {
        return { chatId: null, valid: false };
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const { chatId: encodedChatId } = await context.params;

    if (!encodedChatId) {
        return NextResponse.json({ error: "Missing chatId route parameter." }, { status: 400 });
    }

    const { chatId, valid } = decodeChatId(encodedChatId);

    if (!valid || !chatId) {
        return NextResponse.json({ error: "Invalid chatId route parameter." }, { status: 400 });
    }

    try {
        await deleteChat(chatId);
        return new NextResponse(null, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Could not delete chat." }, { status: 500 });
    }
}
