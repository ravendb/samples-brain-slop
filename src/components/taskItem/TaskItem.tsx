"use client";

import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { Task } from "@/models/task";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./TaskItem.module.css";

type TaskItemProps = {
	task: Task;
};

async function markTaskCompleted(taskId: string, completed: boolean) {
    const result = await fetch('/api/task/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
    });

    if (!result.ok) {
        throw new Error('Failed to update task status');
    }

    return result.json();
}

export default function TaskItem({ task }: TaskItemProps) {
	const [isCompleted, setIsCompleted] = useState(task.completed);
    const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (completed: boolean) => markTaskCompleted(task.id!, completed),
		onError: () => {
			setIsCompleted(prev => !prev);
		},
        onSuccess: (data) => {
            setIsCompleted(data.completed);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
	});

	const handleToggle = () => {
		setIsCompleted(prev => {
			const next = !prev;
			mutation.mutate(next);
			return next;
		});
	};

	return (
		<div className={styles.item}>
			<span
				className={styles.checkbox}
				data-checked={isCompleted}
				role="checkbox"
				onClick={handleToggle}
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
