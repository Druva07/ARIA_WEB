import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET() {
  const db = await dbConnect();
  if (!db) return NextResponse.json([]);
  
  try {
    const tasks = await Task.find({ done: false }).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const db = await dbConnect();
  if (!db) return NextResponse.json({ error: 'DB not connected' }, { status: 500 });
  
  try {
    const body = await req.json();
    const task = await Task.create({ content: body.content });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const db = await dbConnect();
  if (!db) return NextResponse.json({ error: 'DB not connected' }, { status: 500 });
  
  try {
    const body = await req.json();
    const task = await Task.findByIdAndUpdate(body.id, { done: body.done }, { new: true });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
