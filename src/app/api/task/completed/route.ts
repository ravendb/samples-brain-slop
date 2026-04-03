import { NextResponse } from "next/server";
import { isTaskCompleted, markTaskCompleted } from "@/repositories/taskRepo";

export async function POST(request: Request) {
	try {
		const { taskId, completed } = await request.json();
		if (typeof taskId !== "string" || typeof completed !== "boolean") {
			return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
		}
		const result = await markTaskCompleted(taskId, completed);
		return NextResponse.json({ success: true, completed: result });
	} catch (error) {
        console.error("Error updating task status:", error);
		return NextResponse.json({ error: "Failed to update task status" }, { status: 500 });
	}
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
        const encodedTaskId = url.searchParams.get("taskId");
        const taskId = decodeURIComponent(encodedTaskId || "");
		if (typeof taskId !== "string" || !taskId) {
			return NextResponse.json({ error: "Missing or invalid taskId query parameter" }, { status: 400 });
		}

		const result = await isTaskCompleted(taskId);
		return NextResponse.json({ success: true, completed: result });
	} catch (error) {
		console.error("Error getting task status:", error);
		return NextResponse.json({ error: "Failed to get task status" }, { status: 500 });
	}
}
