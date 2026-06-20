import { NextResponse } from "next/server";
import { executeAction, denyActionPermission } from "@/services/actions";
import { Action, ActionMap } from "@/models/action";
import { encodeStream } from "@/services/stream";
import { getSessionMemberDoc } from "@/lib/session";
import { loadProjectDocument } from "@/repositories/projectRepo";
import { loadTaskDocument } from "@/repositories/taskRepo";
import {
    isSameTeam,
    canEditProject,
    canDeleteProject,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canToggleTaskCompletion,
} from "@/lib/permissions";
import { Member } from "@/models/member";

async function checkPermission(member: Member, action: Action): Promise<string | null> {
    switch (action.name) {
        case "CreateProject": {
            const args = action.arguments as ActionMap["CreateProject"];
            if (!isSameTeam(member, args.teamId)) return "You cannot create projects for another team.";
            return null;
        }
        case "AddNewTask": {
            const args = action.arguments as ActionMap["AddNewTask"];
            const project = await loadProjectDocument(args.projectId);
            if (!project) return "Project not found.";
            if (!isSameTeam(member, project.teamId)) return "You cannot add tasks to another team's project.";
            if (!canCreateTask(member, project)) return "You can only add tasks to projects you created.";
            return null;
        }
        case "EditTask": {
            const args = action.arguments as ActionMap["EditTask"];
            const task = await loadTaskDocument(args.taskId);
            if (!task) return "Task not found.";
            const project = await loadProjectDocument(task.projectId);
            if (!project || !isSameTeam(member, project.teamId)) return "You cannot edit tasks from another team.";
            const updatedFields = Object.keys(args.updates ?? {});
            const isCompletionOnlyUpdate = updatedFields.length === 1 && updatedFields[0] === "completed";
            const permitted = isCompletionOnlyUpdate
                ? canToggleTaskCompletion(member, task)
                : canEditTask(member, task);
            if (!permitted) return isCompletionOnlyUpdate
                ? "Only the task creator, assignee, or a manager can mark this task complete."
                : "You can only edit tasks you created or are assigned to.";
            return null;
        }
        case "DeleteTask": {
            const args = action.arguments as ActionMap["DeleteTask"];
            const task = await loadTaskDocument(args.taskId);
            if (!task) return "Task not found.";
            const project = await loadProjectDocument(task.projectId);
            if (!project || !isSameTeam(member, project.teamId)) return "You cannot delete tasks from another team.";
            if (!canDeleteTask(member, task)) return "Only the task creator or a manager can delete this task.";
            return null;
        }
        case "EditProject": {
            const args = action.arguments as ActionMap["EditProject"];
            const project = await loadProjectDocument(args.projectId);
            if (!project) return "Project not found.";
            if (!isSameTeam(member, project.teamId)) return "You cannot edit another team's project.";
            if (!canEditProject(member, project)) return "Only the project creator or a manager can edit this project.";
            return null;
        }
        case "DeleteProject": {
            const args = action.arguments as ActionMap["DeleteProject"];
            const project = await loadProjectDocument(args.projectId);
            if (!project) return "Project not found.";
            if (!isSameTeam(member, project.teamId)) return "You cannot delete another team's project.";
            if (!canDeleteProject(member, project)) return "Only the project creator or a manager can delete this project.";
            return null;
        }
        default:
            return null;
    }
}

export async function POST(request: Request) {
    const { chatId, action } = await request.json() as { chatId: string; action: Action };

    if (!chatId || !action) {
        return NextResponse.json({ error: "Missing chatId or action." }, { status: 400 });
    }

    const member = await getSessionMemberDoc();
    if (!member) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const denialReason = await checkPermission(member, action);

    const stream = denialReason
        ? encodeStream((onChunk) => denyActionPermission(chatId, action, denialReason, onChunk))
        : encodeStream((onChunk) => executeAction(chatId, action, onChunk, { memberId: member.id!, userId: member.userId }));

    return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
