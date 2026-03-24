import { TaskDocument } from "@/models/task";
import { store } from "@/db/ravendb";
import { Task } from "@/models/task";

export async function createTask(task: TaskDocument) {
    const session = store.openSession();
    await session.store(task);
    await session.saveChanges();
}

export function tasksToDocuments(tasks: Task[]) {
    return tasks.map(task => new TaskDocument(
        task.title,
        task.description,
        task.priority,
        task.dueDate
    ));
}

export async function markTaskCompleted(taskId: string, completed: boolean) {
    const session = store.openSession();
    const task = await session.load<TaskDocument>(taskId);
    if (task) {
        task.completed = completed;
        await session.saveChanges();
        return completed;
    }
    throw new Error("Task not found");
}