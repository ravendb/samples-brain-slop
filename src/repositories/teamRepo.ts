import { getStore } from "@/db/ravendb";
import { Team } from "@/models/team";
import { Member } from "@/models/member";

export async function createTeam(name: string, managerId: string) {
    const session = getStore().openSession();
    const team = new Team(name);

    const existing = await session.query<Team>({ collection: "Teams" })
        .whereEquals("name", name)
        .firstOrNull();

    if (existing) {
        throw new Error("Team with that name already exists");
    }
    else {
        await session.store(team);
    }

    if (!team.id) {
        throw new Error("Failed to create team");
    }

    const member = Member.withRandomColor(managerId, team.id, "manager");
    await session.store(member);
    
    await session.saveChanges();
    return {team, member};
}

export async function getTeamById(teamId: string) {
    const session = getStore().openSession();
    return session.load<Team>(teamId);
}