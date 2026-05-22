export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTeamsByUserId } from "@/repositories/memberRepo";
import { createTeam } from "@/repositories/teamRepo";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const teams = await getTeamsByUserId(userId);
    return NextResponse.json(teams);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    const { name } = await request.json().catch(() => ({}));

    if (!name?.trim()) {
        return NextResponse.json({ error: "Team name is required." }, { status: 400 });
    }

    const result = await createTeam(name.trim(), userId);
    return NextResponse.json(result);
}

