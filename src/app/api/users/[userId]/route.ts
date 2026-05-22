export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/repositories/userRepo";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const user = await getUserById(userId);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}
