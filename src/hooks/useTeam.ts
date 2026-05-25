import { useQuery } from "@tanstack/react-query";
import { Team } from "@/models/team";
import { Member } from "@/models/member";
import { User } from "@/models/user";

export type TeamMemberWithUser = { member: Member; user: User };
export type TeamData = { team: Team; members: TeamMemberWithUser[] };

async function fetchTeam(teamId: string): Promise<TeamData> {
    const res = await fetch(`/api/teams/${encodeURIComponent(teamId)}/members`);
    if (!res.ok) throw new Error("Failed to fetch team");
    return res.json();
}

export function useTeam(teamId: string) {
    return useQuery({
        queryKey: ["team", teamId],
        queryFn: () => fetchTeam(teamId),
        staleTime: 60_000,
    });
}
