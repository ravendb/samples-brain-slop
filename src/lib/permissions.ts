import { Member } from "@/models/member";
import { ProjectDocument } from "@/models/project";
import { TaskDocument } from "@/models/task";

export function isSameTeam(member: Member, teamId: string): boolean {
    return member.teamId === teamId;
}

export function canEditProject(member: Member, project: ProjectDocument): boolean {
    if (member.role === "manager") return true;
    return project.createdBy === member.userId;
}

export function canDeleteProject(member: Member, project: ProjectDocument): boolean {
    return canEditProject(member, project);
}

export function canCreateTask(member: Member, project: ProjectDocument): boolean {
    return canEditProject(member, project);
}

export function canEditTask(member: Member, task: TaskDocument): boolean {
    if (member.role === "manager") return true;
    if (task.createdBy === member.id) return true;
    if (task.assigneeId && task.assigneeId === member.id) return true;
    return false;
}

export function canDeleteTask(member: Member, task: TaskDocument): boolean {
    if (member.role === "manager") return true;
    return task.createdBy === member.id;
}

export function canToggleTaskCompletion(member: Member, task: TaskDocument): boolean {
    if (member.role === "manager") return true;
    if (!task.assigneeId) return true;
    if (task.createdBy === member.id) return true;
    return task.assigneeId === member.id;
}
