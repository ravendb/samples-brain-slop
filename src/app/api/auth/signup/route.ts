export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { signup } from "@/repositories/userRepo";
import { setUserIdCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const { username, name } = body ?? {};

    if (!username || !name) {
        return NextResponse.json({ error: "Username and name are required." }, { status: 400 });
    }

    try {
        const user = await signup(username, name) as { id: string };
        await setUserIdCookie(user.id);
        return NextResponse.json({ userId: user.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Signup failed.";
        return NextResponse.json({ error: message }, { status: 409 });
    }
}
