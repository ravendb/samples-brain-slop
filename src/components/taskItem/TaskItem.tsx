"use client";

import { Task } from "@/models/task";
import Checkbox from "@/components/checkbox/Checkbox";
import PriorityBang from "@/components/priorityBang/PriorityBang";
import styles from "./TaskItem.module.css";

export default function TaskItem({ task }: { task: Task }) {
	return (
		<div className={styles.item}>
            <Checkbox taskId={task.id!}  />
			<span className={styles.title}>
				{task.title}
				{task.priority === "high" && (
					<PriorityBang />
				)}
			</span>
		</div>
	);
}
