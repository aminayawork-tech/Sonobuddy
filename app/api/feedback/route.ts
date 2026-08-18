import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, senderEmail } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const body = senderEmail
      ? `From: ${senderEmail}\n\n${message.trim()}`
      : message.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SonoBuddy Feedback <onboarding@resend.dev>',
        to: 'hello@sonobuddy.com',
        subject: senderEmail
          ? `SonoBuddy Feedback from ${senderEmail}`
          : 'SonoBuddy App Feedback',
        text: body,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Feedback route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
