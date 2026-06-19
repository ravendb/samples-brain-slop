import { TaskDocument, NewTask, EditTaskArguments } from "@/models/task";
import { getStore } from "@/db/ravendb";
import { appendUncompletedCount } from "./timeSeriesRepo";

export async function createTask(projectId: string, task: NewTask, createdBy?: string) {
    const taskDocument = taskToDocument(projectId, task, createdBy);

    const session = getStore().openSession();
    await session.store(taskDocument);
    await appendUncompletedCount(session, projectId);
    await session.saveChanges();
}

export async function loadTaskDocument(taskId: string): Promise<TaskDocument | null> {
    const session = getStore().openSession();
    return session.load<TaskDocument>(taskId);
}

export async function editTask(taskId: string, updates: EditTaskArguments["updates"]) {
    const session = getStore().openSession();
    const task = await session.load<TaskDocument>(taskId);
    if (!task) {
        throw new Error("Task not found");
    }

    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            (task as unknown as Record<string, unknown>)[key] = value;
        }
    }

    await session.saveChanges();

    return task;
}

export async function deleteTask(taskId: string) {
    const session = getStore().openSession();
    const task = await session.load<TaskDocument>(taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    const { projectId } = task;
    await session.delete(taskId);
    await appendUncompletedCount(session, projectId);
    await session.saveChanges();
}


export async function markTaskCompleted(taskId: string, completed: boolean) {
    const session = getStore().openSession();
    const task = await session.load<TaskDocument>(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    task.completed = completed;
    await appendUncompletedCount(session, task.projectId);
    await session.saveChanges();
    return completed;
}

export async function isTaskCompleted(taskId: string) {
    const session = getStore().openSession();
    const task = await session.load<TaskDocument>(taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    return task.completed;
}

export function taskToDocument(projectId: string, task: NewTask, createdBy?: string) {
    return new TaskDocument(
        projectId,
        task.title,
        task.description,
        task.priority,
        task.dueDate,
        task.assigneeId,
        createdBy
    );
}
