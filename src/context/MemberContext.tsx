"use client";

import { createContext, useContext } from "react";

type MemberContextValue = { memberId: string; teamId: string };

const MemberContext = createContext<MemberContextValue | null>(null);

export function MemberProvider({ memberId, teamId, children }: { memberId: string; teamId: string; children: React.ReactNode }) {
    return <MemberContext.Provider value={{ memberId, teamId }}>{children}</MemberContext.Provider>;
}

export function useMemberId(): string {
    const value = useContext(MemberContext);
    if (!value) throw new Error("useMemberId must be used within a MemberProvider");
    return value.memberId;
}

export function useTeamId(): string {
    const value = useContext(MemberContext);
    if (!value) throw new Error("useTeamId must be used within a MemberProvider");
    return value.teamId;
}
