import { createTask } from '@/repositories/taskRepo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { title } = await req.json();
    await createTask(title);
    return NextResponse.json({ message: 'Task created successfully!' });
}