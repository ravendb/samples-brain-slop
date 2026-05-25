import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { UserProvider } from "@/context/UserContext";
import styles from "./layout.module.css";
import React from "react";

export default async function UserRingLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await getSession();
    if (!userId) redirect("/auth/login");

    return (
        <UserProvider userId={userId}>
            <div className={styles.container}>
                {children}
            </div>
        </UserProvider>
    );
}
