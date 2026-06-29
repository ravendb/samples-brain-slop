import { schemas } from "@/models/action";
import { executeDemoAction } from "@/services/actions";
import { getSessionMemberDoc } from "@/lib/session";

export async function POST(request: Request) {
    const { type, args } = await request.json();

    const schema = schemas[type as keyof typeof schemas];
    if (!schema) {
        return Response.json({ error: "Unknown action type" }, { status: 400 });
    }

    let resolvedArgs = args;
    if (type === "CreateProject" && !args.teamId) {
        const member = await getSessionMemberDoc();
        if (member?.teamId) resolvedArgs = { ...args, teamId: member.teamId };
    }

    const parsed = schema.safeParse(resolvedArgs);
    if (!parsed.success) {
        console.error("[demo/action] validation failed", type, parsed.error.flatten());
        return Response.json({ error: "Invalid arguments", details: parsed.error.flatten() }, { status: 400 });
    }

    try {
        const context = await executeDemoAction(type, parsed.data);
        return Response.json({ success: true, ...context });
    } catch (err) {
        console.error("[demo/action] executeDemoAction threw", type, err);
        return Response.json({ error: String(err) }, { status: 500 });
    }
}
