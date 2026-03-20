import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Sidebar from "@/components/sidebar/Sidebar";
import ConversationSidebar from "@/components/conversationSidebar/ConversationSidebar";
import shellStyles from "@/app/layout.module.css";
import "./globals.css";

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
        <main className={shellStyles.main}>
          <ConversationSidebar />
          <section className={shellStyles.chatSection}>{children}</section>
          <Sidebar />
        </main>
      </body>
    </html>
  );
}
