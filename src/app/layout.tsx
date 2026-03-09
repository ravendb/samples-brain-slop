import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
