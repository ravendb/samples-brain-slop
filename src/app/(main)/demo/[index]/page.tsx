import { notFound } from "next/navigation";
import demos from "@/data/demos.json";
import DemoChat from "@/components/demoChat/DemoChat";
import styles from "@/app/(main)/chat/[chatid]/page.module.css";

export default async function DemoPage({ params }: { params: Promise<{ index: string }> }) {
    const { index } = await params;
    const demo = demos[Number(index)];
    if (!demo) notFound();

    return (
        <div className={styles.page}>
            <DemoChat steps={demo.steps} />
        </div>
    );
}
