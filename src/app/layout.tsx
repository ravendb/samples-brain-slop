import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/app/providers";
import SamplesUiWrapper from "@/components/samplesUiWrapper/SamplesUiWrapper";
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
        <SamplesUiWrapper sourceLink="https://github.com/ravendb/samples-brain-slop">
          <Providers>{children}</Providers>
        </SamplesUiWrapper>
      </body>
    </html>
  );
}
