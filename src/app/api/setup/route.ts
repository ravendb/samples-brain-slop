export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { runSetup, SetupPayload } from "@/services/setup";

export async function POST(request: NextRequest) {
    let payload: SetupPayload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { ravenUrl, ravenDb, openAiApiKey, mainModel, smallModel } = payload;
    if (!ravenUrl || !ravenDb || !openAiApiKey || !mainModel || !smallModel) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    try {
        await runSetup(payload);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Setup error:", err);
        return NextResponse.json({ error: "Setup failed. Check the server logs for details." }, { status: 500 });
    }
}
