import { Task } from "@/models/task";

export class Project {
    id?: string;
    title: string;
    tasks: Task[];

    constructor(title: string) {
        this.title = title;
        this.tasks = [];
    }
}