import { Task } from "../models/task";
import { store } from "@/db/ravendb";

export async function createTask(title: string) {
    const session = store.openSession();
    const task: Task = new Task(title);

    await session.store<Task>(task);
    await session.saveChanges();
}