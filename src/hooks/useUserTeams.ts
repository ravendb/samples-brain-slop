import { useQuery } from "@tanstack/react-query";
import { Team } from "@/models/team";
import { Member } from "@/models/member";

export type TeamWithMember = { team: Team; member: Member };

async function fetchUserTeams(userId: string): Promise<TeamWithMember[]> {
    const res = await fetch(`/api/users/${userId}/teams`);
    if (!res.ok) throw new Error("Failed to fetch teams");
    return res.json();
}

export function useUserTeams(userId: string) {
    return useQuery({
        queryKey: ["userTeams", userId],
        queryFn: () => fetchUserTeams(userId),
        staleTime: Infinity,
    });
}
