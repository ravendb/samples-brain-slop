import { useQuery } from "@tanstack/react-query";
import { User } from "@/models/user";

async function fetchUser(userId: string): Promise<User> {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error("User not found");
    return res.json();
}

export function useUser(userId: string) {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUser(userId),
        staleTime: Infinity,
    });
}