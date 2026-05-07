import { schemas } from "@/models/action";
import { executeDemoAction } from "@/services/actions";

export async function POST(request: Request) {
    const { type, args } = await request.json();

    const schema = schemas[type as keyof typeof schemas];
    if (!schema) {
        return Response.json({ error: "Unknown action type" }, { status: 400 });
    }

    const parsed = schema.safeParse(args);
    if (!parsed.success) {
        return Response.json({ error: "Invalid arguments" }, { status: 400 });
    }

    const context = await executeDemoAction(type, parsed.data);
    return Response.json({ success: true, ...context });
}
