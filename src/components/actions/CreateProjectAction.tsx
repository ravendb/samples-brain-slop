import { Project } from "@/models/project";
import { Action } from "@/models/action";
import styles from "./Action.module.css";

function summarizeTasks(action: Action<Project>) {
    const totalTasks = action.arguments.tasks?.length ?? 0;
    if (totalTasks === 0) {
        return null;
    }

    return `${totalTasks} task${totalTasks === 1 ? "" : "s"}`;
}

export default function CreateProjectAction({ action }: { action: Action<Project> }) {
    const taskSummary = summarizeTasks(action);

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <p className={styles.label}>Action</p>
                <h3 className={styles.name}>{action.name}</h3>
                <dl className={styles.details}>
                    <div className={styles.row}>
                        <dt>Title</dt>
                        <dd>{action.arguments.title}</dd>
                    </div>

                    {action.arguments.description ? (
                        <div className={styles.row}>
                            <dt>Description</dt>
                            <dd>{action.arguments.description}</dd>
                        </div>
                    ) : null}

                    {action.arguments.dueDate ? (
                        <div className={styles.row}>
                            <dt>Due</dt>
                            <dd>{action.arguments.dueDate}</dd>
                        </div>
                    ) : null}

                    {taskSummary ? (
                        <div className={styles.row}>
                            <dt>Tasks</dt>
                            <dd>{taskSummary}</dd>
                        </div>
                    ) : null}
                </dl>
            </div>

        </article>
    );
}