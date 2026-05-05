import { executeDemoAction } from "@/services/actions";

export async function POST(request: Request) {
    const { type, args } = await request.json();
    const context = await executeDemoAction(type, args);
    return Response.json({ success: true, ...context });
}
