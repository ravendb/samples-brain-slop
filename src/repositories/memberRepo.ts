import { getStore } from "@/db/ravendb";
import { Member } from "@/models/member";
import { Team } from "@/models/team";

export async function createMember(userId: string, teamId: string, role: "manager" | "member") {
    const session = getStore().openSession();
    const member = Member.withRandomColor(userId, teamId, role);
    
    await session.store(member);
    await session.saveChanges();

    return member;
}

export async function getMemberById(memberId: string) {
    const session = getStore().openSession();
    return session.load<Member>(memberId);
}

export async function getTeamsByUserId(userId: string) {
    const session = getStore().openSession();

    const members = await session.query<Member>({ collection: "Members" })
        .whereEquals("userId", userId)
        .include("teamId")
        .all();

    const result = [];
    for (const member of members) {
        const team = await session.load<Team>(member.teamId);
        result.push({ team, member });
    }

    return result;
}

export async function joinTeamByName(userId: string, teamName: string) {
    const session = getStore().openSession();
    const team = await session.query<Team>({ collection: "Teams" })
        .whereEquals("name", teamName)
        .firstOrNull();

    if (!team || !team.id) {
        throw new Error("Team not found");
    }

    const existingMember = await session.query<Member>({ collection: "Members" })
        .whereEquals("userId", userId)
        .whereEquals("teamId", team.id)
        .firstOrNull();

    if (existingMember) {
        throw new Error("User is already a member of this team");
    }

    const member = Member.withRandomColor(userId, team.id, "member");
    
    await session.store(member);
    await session.saveChanges();

    return member;
}