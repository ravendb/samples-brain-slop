import { Action } from "@/models/action";
import styles from "./Action.module.css";

export default function EditProjectAction({ action }: { action: Action<'EditProject'> }) {
    const { projectId, currentTitle, updates } = action.arguments;

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <p className={styles.label}>Action</p>
                <h3 className={styles.name}>{action.name}</h3>

                <dl className={styles.details}>
                    <div className={styles.row}>
                        <dt>Project</dt>
                        <dd>{currentTitle || projectId}</dd>
                    </div>

                    {updates.title ? (
                        <div className={styles.row}>
                            <dt>Title</dt>
                            <dd>{updates.title}</dd>
                        </div>
                    ) : null}

                    {updates.description ? (
                        <div className={styles.row}>
                            <dt>Description</dt>
                            <dd>{updates.description}</dd>
                        </div>
                    ) : null}

                    {updates.dueDate ? (
                        <div className={styles.row}>
                            <dt>Due</dt>
                            <dd>{updates.dueDate}</dd>
                        </div>
                    ) : null}
                </dl>
            </div>
        </article>
    );
}
