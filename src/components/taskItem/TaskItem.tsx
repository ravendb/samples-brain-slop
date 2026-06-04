"use client";

import { Task } from "@/models/task";
import Checkbox from "@/components/checkbox/Checkbox";
import PriorityBang from "@/components/priorityBang/PriorityBang";
import AssigneeChip from "@/components/assigneeChip/AssigneeChip";
import { useMemberMap } from "@/context/TeamContext";
import { useMemberId } from "@/context/MemberContext";
import styles from "./TaskItem.module.css";

export default function TaskItem({ task }: { task: Task }) {
	const memberMap = useMemberMap();
	const currentMemberId = useMemberId();
	const assignee = task.assigneeId ? memberMap[task.assigneeId] : undefined;
	const assigneeName = task.assigneeId === currentMemberId ? "You" : assignee?.name;

	return (
		<div className={styles.item}>
            <Checkbox taskId={task.id!}  />
			<span className={styles.title}>
				{task.title}
				{task.priority === "high" && (
					<PriorityBang />
				)}
			</span>
			{assignee && assigneeName && <AssigneeChip name={assigneeName} color={assignee.color} />}
		</div>
	);
}
