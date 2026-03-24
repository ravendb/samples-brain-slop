import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/app/providers";
import ProjectSidebar from "@/components/projectSidebar/ProjectSidebar";
import ConversationSidebar from "@/components/conversationSidebar/ConversationSidebar";
import shellStyles from "@/app/layout.module.css";
import "./globals.css";
import React from "react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Brain Slop",
  description: "AI-assisted task management application designed for busy managers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <Providers>
          <main className={shellStyles.main}>
            <ConversationSidebar />
            <section className={shellStyles.chatSection}>{children}</section>
            <ProjectSidebar />
          </main>
        </Providers>
      </body>
    </html>
  );
}
