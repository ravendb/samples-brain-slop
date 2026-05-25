import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config";
import { getSession } from "@/lib/session";
import { getMemberById } from "@/repositories/memberRepo";
import { MemberProvider } from "@/context/MemberContext";
import ProjectSidebar from "@/components/projectSidebar/ProjectSidebar";
import LeftSidebar from "@/components/leftSidebar/LeftSidebar";
import shellStyles from "./layout.module.css";
import React from "react";

export default async function MemberShellLayout({ children }: { children: React.ReactNode }) {
    if (!getAppConfig()) redirect("/setup");

    const { memberId } = await getSession();
    if (!memberId) redirect("/profile");

    const member = await getMemberById(memberId);
    if (!member) redirect("/profile");

    return (
        <MemberProvider memberId={memberId} teamId={member.teamId}>
            <main className={shellStyles.main}>
                <LeftSidebar />
                <section className={shellStyles.chatSection}>{children}</section>
                <ProjectSidebar />
            </main>
        </MemberProvider>
    );
}
