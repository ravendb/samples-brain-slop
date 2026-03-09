export class Task {
    id?: string;
    title: string;
    description?: string;
    date: Date;

    constructor(title: string) {
        this.title = title;
        this.date = new Date();
    }
}