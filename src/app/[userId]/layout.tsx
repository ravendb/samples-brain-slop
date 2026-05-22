import styles from "./layout.module.css";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            {children}
        </div>
    );
}
