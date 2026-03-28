import { TaskDocument } from "@/models/task";
import { store } from "@/db/ravendb";
import { Task } from "@/models/task";
import { ProjectDocument } from "@/models/project";

export async function createTask(projectId: string, task: TaskDocument) {
    const taskDocument = taskToDocument(task);

    const session = store.openSession();
    await session.store(taskDocument);
    if (!taskDocument.id) {
        throw new Error("Failed to store task");
    }

    const project = await session.load<ProjectDocument>(projectId);
    if (!project) {
        throw new Error("Project not found");
    }
    project.taskIds.push(taskDocument.id);
    
    await session.saveChanges();
}

export function taskToDocument(task: Task) {
    return new TaskDocument(
        task.title,
        task.description,
        task.priority,
        task.dueDate
    );
}

export async function markTaskCompleted(taskId: string, completed: boolean) {
    const session = store.openSession();
    const task = await session.load<TaskDocument>(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    task.completed = completed;
    await session.saveChanges();
    return completed;
}

export async function isTaskCompleted(taskId: string) {
    const session = store.openSession();
    const task = await session.load<TaskDocument>(taskId);
    
    if (!task) {
        throw new Error("Task not found");
    }

    return task.completed;
}