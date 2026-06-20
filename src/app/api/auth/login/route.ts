export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { login } from "@/repositories/userRepo";
import { setUserIdCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const { username } = body ?? {};

    if (!username) {
        return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    try {
        const user = await login(username) as { id: string };
        await setUserIdCookie(user.id);
        return NextResponse.json({ userId: user.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed.";
        return NextResponse.json({ error: message }, { status: 404 });
    }
}
