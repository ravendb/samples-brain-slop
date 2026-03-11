import Link from "next/link";
import { Task } from "@/models/task";
import styles from "./TaskItem.module.css";

type TaskItemProps = {
	task: Task;
};

const priorityClassMap: Record<Task["priority"], string> = {
	low: styles.priorityLow,
	normal: styles.priorityNormal,
	high: styles.priorityHigh,
};

export default function TaskItem({ task }: TaskItemProps) {
	const taskId = task.id ?? "unknown";

	return (
		<Link href={`/task/${taskId}`} className={styles.item}>
			<span
				className={`${styles.priorityDot} ${priorityClassMap[task.priority]}`}
				aria-hidden="true"
			/>
			<span className={styles.title}>{task.title}</span>
		</Link>
	);
}
