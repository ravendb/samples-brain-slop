export class Task {
    id?: string;
    title: string;
    description?: string;
    priority: "low" | "normal" | "high";
    date: Date;

    constructor(title: string, priority: "low" | "normal" | "high" = "normal") {
        this.title = title;
        this.priority = priority;
        this.date = new Date();
    }
}