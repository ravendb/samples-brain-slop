import { Action, AddNewTaskArguments } from "@/models/action";
import styles from "./Action.module.css";

export default function AddNewTaskAction({ action }: { action: Action<AddNewTaskArguments> }) {
    const task = action.arguments.task;

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <p className={styles.label}>Action</p>
                <h3 className={styles.name}>{action.name}</h3>

                <dl className={styles.details}>
                    <div className={styles.row}>
                        <dt>Project</dt>
                        <dd>{action.arguments.projectTitle}</dd>
                    </div>

                    <div className={styles.row}>
                        <dt>Title</dt>
                        <dd>{task.title}</dd>
                    </div>

                    {task.description ? (
                        <div className={styles.row}>
                            <dt>Description</dt>
                            <dd>{task.description}</dd>
                        </div>
                    ) : null}

                    {task.dueDate ? (
                        <div className={styles.row}>
                            <dt>Due</dt>
                            <dd>{task.dueDate}</dd>
                        </div>
                    ) : null}

                    <div className={styles.row}>
                        <dt>Priority</dt>
                        <dd style={{ textTransform: "capitalize" }}>{task.priority}</dd>
                    </div>
                </dl>
            </div>
        </article>
    );
}
