export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAppConfig, writeAppConfig } from "@/lib/config";

export async function GET() {
    const config = getAppConfig();
    return NextResponse.json({ completed: config?.onboardingCompleted ?? false });
}

export async function POST() {
    const config = getAppConfig();
    if (!config) {
        return NextResponse.json({ error: "App is not configured." }, { status: 409 });
    }

    writeAppConfig({ ...config, onboardingCompleted: true });
    return NextResponse.json({ success: true });
}
