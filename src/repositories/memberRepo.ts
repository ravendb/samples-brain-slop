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