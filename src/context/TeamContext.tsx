"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeamId } from "@/context/MemberContext";
import { Member } from "@/models/member";
import { MemberMap } from "@/models/member";
import { User } from "@/models/user";

async function fetchMembers(teamId: string): Promise<MemberMap> {
    const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}/members`);
    if (!response.ok) throw new Error("Failed to fetch team members");
    const data: { members: { member: Member; user: User }[] } = await response.json();
    return Object.fromEntries(
        data.members.map(({ member, user }) => [member.id!, { name: user.name, color: member.color }])
    );
}

const TeamContext = createContext<MemberMap>({});

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const teamId = useTeamId();
    const { data: memberMap = {} } = useQuery<MemberMap>({
        queryKey: ["team-members", teamId],
        queryFn: () => fetchMembers(teamId),
    });

    return <TeamContext.Provider value={memberMap}>{children}</TeamContext.Provider>;
}

export function useMemberMap(): MemberMap {
    return useContext(TeamContext);
}
