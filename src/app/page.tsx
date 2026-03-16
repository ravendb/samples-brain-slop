import Sidebar from "@/components/sidebar/Sidebar";
import ConversationSidebar from "@/components/conversationSidebar/ConversationSidebar";
import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <Sidebar />
      <section className={styles.chatSection}>
        Chat panel
      </section>
      <ConversationSidebar />
    </main>
  );
}
