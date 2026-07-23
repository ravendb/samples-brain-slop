import { useQuery } from "@tanstack/react-query";
import { Project } from "@/models/project";

async function fetchProjects(teamId: string): Promise<Project[]> {
    const res = await fetch(`/api/projects?teamId=${encodeURIComponent(teamId)}`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    return data.projects;
}

export function useTeamProjects(teamId: string) {
    return useQuery({
        queryKey: ["projects", teamId],
        queryFn: () => fetchProjects(teamId),
    });
}
