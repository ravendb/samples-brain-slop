import { redirect } from "next/navigation";
import { createTask } from "@/repositories/taskRepo";

async function createTaskAction(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await createTask(title);
}

export default function Home() {
  return (
    <main>
      <h1>Brain Slop</h1>
      <form action={createTaskAction}>
        <input type="text" name="title" placeholder="Task title" required />
        <button type="submit">Create Task</button>
      </form>
    </main>
  );
}
