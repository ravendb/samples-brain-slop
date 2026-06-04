import { loadProject } from "@/repositories/projectRepo";
import { getMembersByTeamId } from "@/repositories/memberRepo";
import { getUserById } from "@/repositories/userRepo";
import { getSession } from "@/lib/session";
import { compareTasksByDueDate } from "@/services/tasks";
import Checkbox from "@/components/checkbox/Checkbox";
import AssigneeChip from "@/components/assigneeChip/AssigneeChip";
import styles from "./page.module.css";
import PriorityBang from "@/components/priorityBang/PriorityBang";
import { MemberMap } from "@/models/member";

type ProjectPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id: encodedId } = await params;
    const id = decodeURIComponent(encodedId);
    const project = await loadProject(id);
    if (!project) {
        return (
            <main className={styles.main}>
                <h1>Project Not Found</h1>
                <p>No project found with ID: {id}</p>
            </main>
        );
    }

    const tasks = project.tasks.toSorted(compareTasksByDueDate);
    const { memberId: currentMemberId } = await getSession();

    const members = await getMembersByTeamId(project.teamId);
    const memberMap: MemberMap = Object.fromEntries(
        await Promise.all(
            members.map(async (member) => {
                const user = await getUserById(member.userId);
                return [member.id!, { name: user?.name ?? "Unknown", color: member.color }] as const;
            })
        )
    );

    return (
      <main className={styles.main}>
        <div className={styles.projectCard}>
          <h1 className={styles.title}>{project.title}</h1>
          <div className={styles.infoGrid}>
            <div>
              <span className={styles.value}>{project.description}</span>
            </div>
            {project.dueDate && (
              <div>
                <span className={styles.label}>Due Date:</span>
                <span className={styles.value}>{project.dueDate}</span>
              </div>
            )}
          </div>
        </div>
        <section className={styles.tasksSection}>
          <h2 className={styles.tasksTitle}>Tasks</h2>
          {project.tasks && project.tasks.length > 0 ? (
            <ul className={styles.tasksList}>
                {tasks.map((task) => (
                    <li className={styles.taskCard} key={task.id ?? task.title}>
                        <div className={styles.taskHeader}>
                            <Checkbox taskId={task.id!} />
                            <span className={styles.taskTitle}>
                                {task.title}
                                {task.priority === "high" && <PriorityBang />}
                            </span>
                        </div>
                        {task.description && (
                            <div className={styles.taskDescription}>{task.description}</div>
                        )}
                        <div className={styles.taskMeta}>
                            {task.dueDate && <span>Due: {task.dueDate}</span>}
                            {task.assigneeId && memberMap[task.assigneeId] && (
                                <AssigneeChip
                                    name={task.assigneeId === currentMemberId ? "You" : memberMap[task.assigneeId].name}
                                    color={memberMap[task.assigneeId].color}
                                />
                            )}
                        </div>
                    </li>
                ))}
            </ul>
          ) : (
            <p className={styles.noTasks}>No tasks for this project.</p>
          )}
        </section>
      </main>
    );
}
