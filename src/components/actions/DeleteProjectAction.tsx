import { Action } from "@/models/action";
import styles from "./Action.module.css";

export default function DeleteProjectAction({ action }: { action: Action<'DeleteProject'> }) {
    const args = action.arguments;

    return (
        <article className={styles.card}>
            <div className={styles.content}>
                <p className={styles.label}>Action</p>
                <h3 className={styles.name}>{action.name}</h3>

                <dl className={styles.details}>
                    <div className={styles.row}>
                        <dt>Project</dt>
                        <dd>{args.title}</dd>
                    </div>
                </dl>
            </div>
        </article>
    );
}
