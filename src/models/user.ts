export class User {
    id?: string;
    username: string;
    name: string;

    constructor(username: string, name: string) {
        this.username = username;
        this.name = name;
    }
} 