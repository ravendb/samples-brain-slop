import { Project } from "@/models/project"
import { store } from "@/db/ravendb";

export async function createProject(title: string) {
    const session = store.openSession();
    const project = new Project(title);
    await session.store(project);
    await session.saveChanges();
}