import { Project, ProjectDocument, EditProjectArguments, CreateProjectArguments } from "@/models/project"
import { TaskDocument } from "@/models/task";
import { getStore } from "@/db/ravendb";
import { taskToDocument } from "./taskRepo";

export async function createProjectFromAction(project: CreateProjectArguments): Promise<{ projectId: string; taskIds: string[] }> {
    const projectDocument = new ProjectDocument(project.title, project.description, project.teamId, project.createdBy, project.dueDate);
    const session = getStore().openSession();

    await session.store(projectDocument);
    const projectId = projectDocument.id!;

    const taskIds: string[] = [];
    for (const task of project.tasks ?? []) {
        const taskDoc = taskToDocument(projectId, task);
        await session.store(taskDoc);
        taskIds.push(taskDoc.id!);
    }

    await session.saveChanges();

    return { projectId, taskIds };
}

function documentToProject(doc: ProjectDocument, tasks: TaskDocument[]): Project {
    return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        dueDate: doc.dueDate,
        teamId: doc.teamId,
        createdBy: doc.createdBy,
        tasks
    };
}

export async function loadProjects(teamId: string): Promise<Project[]> {
    const session = getStore().openSession();
    const documents = await session.query(ProjectDocument)
        .whereEquals("teamId", teamId)
        .all();

    const projects: Project[] = [];
    for (const doc of documents) {
        const tasks = await session.query(TaskDocument)
            .whereEquals("projectId", doc.id)
            .all();
        projects.push(documentToProject(doc, tasks));
    }

    return projects;
}

export async function loadProject(id: string) {
    const session = getStore().openSession();

    const document = await session.load<ProjectDocument>(id);

    if (!document) {
        return null;
    }

    const tasks = await session.query(TaskDocument)
        .whereEquals("projectId", id)
        .all();

    return documentToProject(document, tasks);
}

export async function editProject(projectId: string, updates: EditProjectArguments["updates"]) {
    const session = getStore().openSession();
    const project = await session.load<ProjectDocument>(projectId);
    if (!project) {
        throw new Error(`Project with id ${projectId} not found`);
    }

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            (project as unknown as Record<string, unknown>)[key] = value;
        }
    }

    await session.saveChanges();

    return project;
}

export async function deleteProject(projectId: string) {
    const session = getStore().openSession();

    const tasks = await session.query(TaskDocument)
        .whereEquals("projectId", projectId)
        .all();

    for (const task of tasks) {
        await session.delete(task.id!);
    }

    await session.delete(projectId);

    await session.saveChanges();
}
