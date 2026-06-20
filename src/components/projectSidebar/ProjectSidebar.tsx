"use client";

import ProjectItem from "@/components/projectItem/ProjectItem";
import { Project } from "@/models/project";
import { useQuery } from "@tanstack/react-query";
import styles from "./ProjectSidebar.module.css";
import { useTeamId } from "@/context/MemberContext";

async function fetchProjects(teamId: string): Promise<Project[]> {
  const response = await fetch(`/api/projects?teamId=${encodeURIComponent(teamId)}`);

  if (!response.ok) throw new Error("Failed to fetch projects");

  const data = await response.json();
  return data.projects;
}

export default function ProjectSidebar() {
	const teamId = useTeamId();
	const { data: projects, isLoading, error } = useQuery<Project[]>({
		queryKey: ["projects", teamId],
		queryFn: () => fetchProjects(teamId),
	});

	return (
		<aside className={styles.sidebar}>
			<div className={styles.header}>
				<h2 className={styles.title}>Your projects</h2>
			</div>
			<div className={styles.projectList}>
				{isLoading && <div>Loading projects...</div>}
				{error && <p className={styles.error}>Could not load projects</p>}
				{projects && projects.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</div>
		</aside>
	);
}
