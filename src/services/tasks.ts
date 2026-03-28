import { Task } from "@/models/task";

export function compareTasksByDueDate(a: Task, b: Task) {
    if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    else if (a.dueDate) {
        return -1;
    }
    else if (b.dueDate) {
        return 1;
    }
    else {
        return 0;
    }
}