import { NextResponse } from "next/server";
import { markTaskCompleted } from "@/repositories/taskRepo";

export async function POST(request: Request) {
	try {
		const { taskId, completed } = await request.json();
		if (typeof taskId !== "string" || typeof completed !== "boolean") {
			return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
		}
		await markTaskCompleted(taskId, completed);
		return NextResponse.json({ success: true });
	} catch (error) {
        console.error("Error updating task status:", error);
		return NextResponse.json({ error: "Failed to update task status" }, { status: 500 });
	}
}
