export class Team {
    id?: string;
    name: string;
    members: string[];
    projects: string[];

    constructor(name: string) {
        this.name = name;
        this.members = [];
        this.projects = [];
    }
}