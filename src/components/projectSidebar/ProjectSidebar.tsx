"use client";

import ProjectItem from "@/components/projectItem/ProjectItem";
import { Project } from "@/models/project";
import { useQuery } from "@tanstack/react-query";
import styles from "./ProjectSidebar.module.css";

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");

  if (!response.ok) throw new Error("Failed to fetch projects");

  const data = await response.json();
  return data.projects;
}

export default function ProjectSidebar() {
	const { data: projects, isLoading, error } = useQuery<Project[]>({
		queryKey: ["projects"],
		queryFn: fetchProjects,
	});

	return (
		<aside className={styles.sidebar}>
			<div className={styles.header}>
				<h2 className={styles.title}>Your projects</h2>
			</div>
			<div className={styles.projectList}>
				{isLoading && <div>Loading projects...</div>}
				{error && <div>Failed to load projects</div>}
				{projects && projects.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</div>
		</aside>
	);
}
