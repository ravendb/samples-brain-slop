import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAppConfig } from "@/lib/config";
import { UserProvider } from "@/context/UserContext";
import styles from "./layout.module.css";
import React from "react";

// getAppConfig() reads from the filesystem before any dynamic API runs, so the
// build can prerender this ring with the setup redirect baked in — force every
// segment below (profile, team forms, member routes) to render on demand.
export const dynamic = "force-dynamic";

export default async function UserRingLayout({ children }: { children: React.ReactNode }) {
    if (!getAppConfig()) redirect("/setup");

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
