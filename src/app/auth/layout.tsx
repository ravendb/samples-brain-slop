import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config";
import React from "react";

// getAppConfig() reads from the filesystem, which doesn't opt the route into
// dynamic rendering on its own — without this the guard would run at build time.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    if (!getAppConfig()) redirect("/setup");

    return children;
}
