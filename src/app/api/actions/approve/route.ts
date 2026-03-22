import { NextResponse } from "next/server";
import { executeAction } from "@/services/actions";
import { Action } from "@/models/action";

export async function POST(request: Request) {
    const { chatId, action } = await request.json() as { chatId: string; action: Action };

    if (!chatId || !action) {
        return NextResponse.json({ error: "Missing chatId or action." }, { status: 400 });
    }

    try {
        const result = await executeAction(chatId, action);
        console.log("Action execution result:", result);
        return NextResponse.json(result);
    } catch (err) {
        console.error("Error executing action", err);
        return NextResponse.json({ error: "Could not execute action." }, { status: 500 });
    }
}
