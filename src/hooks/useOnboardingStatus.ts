import { useQuery } from "@tanstack/react-query";

async function fetchOnboardingStatus(): Promise<boolean> {
    const res = await fetch("/api/onboarding");
    if (!res.ok) throw new Error("Failed to fetch onboarding status");
    const data = await res.json();
    return data.completed;
}

export function useOnboardingStatus() {
    return useQuery({
        queryKey: ["onboardingStatus"],
        queryFn: fetchOnboardingStatus,
    });
}
