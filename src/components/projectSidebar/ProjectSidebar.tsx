"use client";

import ProjectItem from "@/components/projectItem/ProjectItem";
import styles from "./ProjectSidebar.module.css";
import { useTeamId } from "@/context/MemberContext";
import { useTeamProjects } from "@/hooks/useTeamProjects";

export default function ProjectSidebar() {
	const teamId = useTeamId();
	const { data: projects, isLoading, error } = useTeamProjects(teamId);

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
