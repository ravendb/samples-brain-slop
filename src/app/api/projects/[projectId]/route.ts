import { NextRequest, NextResponse } from "next/server";
import { loadProject } from "@/repositories/projectRepo";

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

    const projectId = decodeURIComponent(encodedProjectId).trim();
    const project = await loadProject(projectId);

    if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
}