import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set correctly in .env.local' }, { status: 500 });
  }

  try {
    const { message, history } = await req.json();
    const db = await dbConnect();

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 1. Intent Extraction
    const intentPrompt = `
Does the following message contain an intent to remember something, set a reminder, or a task to do today?
Examples of intents: "remember that...", "remind me to...", "I want to do X today", "Need to buy groceries".
Message: "${message}"

Respond strictly with a JSON object:
{"has_intent": true/false, "task_description": "extracted task if true, else null"}`;

    let addedTask = null;
    if (db) {
      try {
        const intentRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: intentPrompt,
        });
        let text = intentRes.text?.trim() || "";
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        
        const data = JSON.parse(text);
        if (data.has_intent && data.task_description) {
          addedTask = await Task.create({ content: data.task_description });
        }
      } catch (e) {
        console.error("Intent extraction failed", e);
      }
    }

    // 2. Fetch pending tasks for context
    let taskContext = "No pending tasks.";
    if (db) {
      const pendingTasks = await Task.find({ done: false });
      if (pendingTasks.length > 0) {
        taskContext = `Pending Tasks:\n${pendingTasks.map(t => `- ${t.content}`).join('\n')}`;
      }
    }

    const systemInstruction = `You are ARIA (Activity-aware Remembrance & Intelligent Assistant), a local AI personal assistant.
[SYSTEM CONTEXT INJECTION]
Current Context for this conversation:
${taskContext}

Please be aware of these tasks and gently remind me or refer to them if relevant to my questions.
[/SYSTEM CONTEXT INJECTION]`;

    // 3. Format Conversation History for Stateless API call
    const fullHistory = (history || []).map((msg: any) => `${msg.role === 'user' ? 'User' : 'ARIA'}: ${msg.content}`).join('\n');
    const finalPrompt = `${systemInstruction}\n\nConversation History:\n${fullHistory}\nUser: ${message}\nARIA:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    return NextResponse.json({ 
      text: response.text, 
      taskAdded: !!addedTask,
      task: addedTask 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
