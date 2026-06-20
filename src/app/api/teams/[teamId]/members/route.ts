export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTeamById } from "@/repositories/teamRepo";
import { getMembersByTeamId } from "@/repositories/memberRepo";
import { getUserById } from "@/repositories/userRepo";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    const { teamId } = await params;

    const team = await getTeamById(teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const members = await getMembersByTeamId(teamId);
    const membersWithUsers = await Promise.all(
        members.map(async (member) => {
            const user = await getUserById(member.userId);
            return { member, user };
        })
    );

    return NextResponse.json({ team, members: membersWithUsers });
}
