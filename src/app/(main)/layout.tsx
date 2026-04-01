import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config";
import ProjectSidebar from "@/components/projectSidebar/ProjectSidebar";
import ConversationSidebar from "@/components/conversationSidebar/ConversationSidebar";
import shellStyles from "./layout.module.css";
import React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!getAppConfig()) redirect("/setup");

  return (
    <main className={shellStyles.main}>
      <ConversationSidebar />
      <section className={shellStyles.chatSection}>{children}</section>
      <ProjectSidebar />
    </main>
  );
}
