import styles from "./LeftSidebar.module.css";
import ChatsPanel from "./ChatsPanel";
import TeamPanel from "./TeamPanel";

export default function LeftSidebar() {
    return (
        <aside className={styles.sidebar}>
            <ChatsPanel />
            <TeamPanel />
        </aside>
    );
}
