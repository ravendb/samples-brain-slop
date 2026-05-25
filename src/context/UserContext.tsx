"use client";

import { createContext, useContext, useState } from "react";

type UserContextType = {
    userId: string | null;
    setUserId: (id: string | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    return <UserContext.Provider value={{ userId, setUserId }}>{children}</UserContext.Provider>;
}

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
    return ctx;
}

export function useUserId(): string {
    const { userId } = useUserContext();
    if (!userId) throw new Error("No user logged in");
    return userId;
}
