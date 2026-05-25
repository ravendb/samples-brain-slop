"use client";

import { createContext, useContext } from "react";

const MemberContext = createContext<string | null>(null);

export function MemberProvider({ memberId, children }: { memberId: string; children: React.ReactNode }) {
    return <MemberContext.Provider value={memberId}>{children}</MemberContext.Provider>;
}

export function useMemberId(): string {
    const value = useContext(MemberContext);
    if (!value) throw new Error("useMemberId must be used within a MemberProvider");
    return value;
}
