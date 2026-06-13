import { IDocumentSession } from "ravendb";
import { TaskDocument } from "@/models/task";

export async function appendUncompletedCount(
    session: IDocumentSession,
    projectId: string
) {
    const count = await session.query<TaskDocument>({ collection: "TaskDocuments" })
        .whereEquals("projectId", projectId)
        .whereEquals("completed", false)
        .count();

    session.timeSeriesFor(projectId, "UncompletedTasks").append(new Date(), count);
}
