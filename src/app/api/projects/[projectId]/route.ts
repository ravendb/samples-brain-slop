import { NextRequest, NextResponse } from "next/server";
import { loadProject } from "@/repositories/projectRepo";
import { getSessionMemberDoc } from "@/lib/session";

type RouteContext = {
    params: Promise<{
        projectId?: string;
    }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
    const { projectId: encodedProjectId } = await context.params;

    if (!encodedProjectId) {
        return NextResponse.json({ error: "Missing projectId route parameter." }, { status: 400 });
    }

    const member = await getSessionMemberDoc();
    if (!member) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const projectId = decodeURIComponent(encodedProjectId).trim();
    const project = await loadProject(projectId);

    if (!project || project.teamId !== member.teamId) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
}