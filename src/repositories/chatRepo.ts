import { store } from "@/db/ravendb";
import { QueryData } from "ravendb";

export async function loadChats() {
    const session = store.openSession();

    const queryData = new QueryData(
        ["@metadata.@id", "LastMessageAt"],
        ["id", "updatedAt"]
    );

    const chats = await session.query({ collection: "@conversations" })
        .selectFields(queryData)
        .all();

    return chats;
}