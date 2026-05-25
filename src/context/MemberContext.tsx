"use client";

import { createContext, useContext, useState } from "react";

type MemberContextType = {
    memberId: string | null;
    setMemberId: (id: string | null) => void;
};

const MemberContext = createContext<MemberContextType | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
    const [memberId, setMemberId] = useState<string | null>(null);
    return <MemberContext.Provider value={{ memberId, setMemberId }}>{children}</MemberContext.Provider>;
}

export function useMemberContext() {
    const ctx = useContext(MemberContext);
    if (!ctx) throw new Error("useMemberContext must be used within a MemberProvider");
    return ctx;
}

export function useMemberId(): string {
    const { memberId } = useMemberContext();
    if (!memberId) throw new Error("No member selected");
    return memberId;
}
