import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/app/providers";
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
