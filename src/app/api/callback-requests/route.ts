import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, goal } = body || {};

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields: name, email, phone' }, { status: 400 });
    }

    const record = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      goal: goal ? String(goal).trim() : '',
      timestamp: new Date().toISOString(),
    };

    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'callback-requests.jsonl');

    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(filePath, JSON.stringify(record) + '\n', 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 });
  }
}