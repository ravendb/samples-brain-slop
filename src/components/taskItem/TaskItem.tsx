"use client";

import { useState } from "react";
import { Task } from "@/models/task";
import styles from "./TaskItem.module.css";

type TaskItemProps = {
	task: Task;
};

export default function TaskItem({ task }: TaskItemProps) {
	const [isCompleted, setIsCompleted] = useState(task.completed);

	return (
		<div className={styles.item}>
			<span
				className={styles.checkbox}
                data-checked={isCompleted}
				role="checkbox"
				onClick={() => setIsCompleted((prev) => !prev)}
			>
				{isCompleted && (
					<img
						src="/check_small.svg"
						alt="Checked"
						className={styles.checkmark}
					/>
				)}
			</span>
			<span className={styles.title}>
				{task.title}
				{task.priority === "high" && (
					<span className={styles.priorityBang}>!</span>
				)}
			</span>
		</div>
	);
}
