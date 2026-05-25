"use client";

import { createContext, useContext } from "react";

const UserContext = createContext<string | null>(null);

export function UserProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
    return <UserContext.Provider value={userId}>{children}</UserContext.Provider>;
}

export function useUserId(): string {
    const value = useContext(UserContext);
    if (!value) throw new Error("useUserId must be used within a UserProvider");
    return value;
}
