import ProjectItem from "@/components/projectItem/ProjectItem";
import { Project } from "@/models/project";
import styles from "./Sidebar.module.css";

const projects: Project[] = [
	{
		id: "p-accounting-cleanup",
		title: "Accounting Cleanup",
		tasks: [
			{
				id: "t-call-mark",
				title: "Call Mark about unpaid invoices",
				priority: "high",
				date: new Date(),
			},
			{
				id: "t-send-board-report",
				title: "Send board report by Friday",
				priority: "normal",
				date: new Date(),
			},
			{
				id: "t-buy-coffee",
				title: "Order office coffee",
				priority: "low",
				date: new Date(),
			},
		],
	},
	{
		id: "p-product-rollout",
		title: "Product Rollout",
		tasks: [
			{
				id: "t-fix-login",
				title: "Fix login bug on Chrome",
				priority: "high",
				date: new Date(),
			},
			{
				id: "t-update-docs",
				title: "Update release documentation",
				priority: "normal",
				date: new Date(),
			},
		],
	},
];

export default function Sidebar() {
	return (
		<aside className={styles.sidebar}>
			<div className={styles.header}>
				<h2 className={styles.title}>Your projects</h2>
			</div>
			<div className={styles.projectList}>
				{projects.map((project) => (
					<ProjectItem key={project.id} project={project} />
				))}
			</div>
		</aside>
	);
}
