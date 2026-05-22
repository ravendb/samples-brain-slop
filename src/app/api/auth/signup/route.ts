export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    console.log("[POST /api/auth/signup]", body);
    return NextResponse.json({ success: true });
}
