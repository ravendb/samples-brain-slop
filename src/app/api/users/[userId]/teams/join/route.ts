export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { joinTeamByName } from "@/repositories/memberRepo";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const { teamName } = await request.json().catch(() => ({}));

    if (!teamName?.trim()) {
        return NextResponse.json({ error: "Team name is required." }, { status: 400 });
    }

    try {
        const member = await joinTeamByName(userId, teamName.trim());
        return NextResponse.json(member);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to join team.";
        return NextResponse.json({ error: message }, { status: 404 });
    }
}
