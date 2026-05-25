import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config";
import { getSession } from "@/lib/session";
import { MemberProvider } from "@/context/MemberContext";
import ProjectSidebar from "@/components/projectSidebar/ProjectSidebar";
import ConversationSidebar from "@/components/conversationSidebar/ConversationSidebar";
import shellStyles from "./layout.module.css";
import React from "react";

export default async function MemberShellLayout({ children }: { children: React.ReactNode }) {
    if (!getAppConfig()) redirect("/setup");

    const { memberId } = await getSession();
    if (!memberId) redirect("/profile");

    return (
        <MemberProvider memberId={memberId}>
            <main className={shellStyles.main}>
                <ConversationSidebar />
                <section className={shellStyles.chatSection}>{children}</section>
                <ProjectSidebar />
            </main>
        </MemberProvider>
    );
}
