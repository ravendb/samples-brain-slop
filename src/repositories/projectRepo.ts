import { Project, ProjectDocument } from "@/models/project"
import { TaskDocument } from "@/models/task";
import { store } from "@/db/ravendb";
import { tasksToDocuments } from "./taskRepo";

export async function createProject(project: ProjectDocument, tasks: TaskDocument[]) {
    const session = store.openSession();

    const taskIds: string[] = [];
    for (const task of tasks) {
        await session.store(task);
        taskIds.push(task.id!);
    }
    project.setTasks(taskIds);

    await session.store(project);
    await session.saveChanges();
}

export async function createProjectFromAction(project: Project) {
    const projectDocument = new ProjectDocument(project.title, project.description, project.dueDate);
    const taskDocuments = tasksToDocuments(project.tasks || []);
    await createProject(projectDocument, taskDocuments);
}

export async function loadProjects(): Promise<Project[]> {
    const session = store.openSession();
    const documents = await session.query(ProjectDocument)
        .include("taskIds")
        .all();
        
    const projects: Project[] = [];
    for (const doc of documents) {
        const tasksDocs = await session.load<TaskDocument>(doc.taskIds);
        const tasks = Object.values(tasksDocs) as TaskDocument[];

        projects.push(doc.toProject(tasks));
    }

    return projects;
}