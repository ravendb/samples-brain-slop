import { createTask } from '@/repositories/taskRepo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { projectId, title } = await req.json();
    await createTask(projectId, title);
    return NextResponse.json({ message: 'Task created successfully!' });
}