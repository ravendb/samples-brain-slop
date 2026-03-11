import Sidebar from "@/components/sidebar/Sidebar";
import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.chatSection}>
        Chat panel
      </section>
    </main>
  );
}
