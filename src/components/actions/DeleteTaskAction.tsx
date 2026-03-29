import { Action } from "@/models/action";
import { DeleteTaskArguments } from "@/models/task";
import styles from "./Action.module.css";

export default function DeleteTaskAction({ action }: { action: Action<'DeleteTask'> }) {
    const { projectTitle, taskTitle } = action.arguments as DeleteTaskArguments;

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <p className={styles.label}>Action</p>
                <h3 className={styles.name}>{action.name}</h3>

                <dl className={styles.details}>
                    <div className={styles.row}>
                        <dt>Project</dt>
                        <dd>{projectTitle}</dd>
                    </div>
                    <div className={styles.row}>
                        <dt>Task</dt>
                        <dd>{taskTitle}</dd>
                    </div>
                </dl>
            </div>
        </article>
    );
}
