import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// The iOS app runs from the sono-web:// custom scheme, so every call here is
// cross-origin and triggers a CORS preflight. Without these the browser blocks
// the POST before it leaves the device — which reads as a network failure.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { message, senderEmail } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400, headers: CORS });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500, headers: CORS });
    }

    const body = senderEmail
      ? `From: ${senderEmail}\n\n${message.trim()}`
      : message.trim();

    // sonobuddy.com is verified at resend.com/domains, so mail can be sent
    // from the domain to any recipient. The env vars are escape hatches for
    // redirecting feedback without a deploy.
    const from = process.env.FEEDBACK_FROM ?? 'SonoBuddy Feedback <feedback@sonobuddy.com>';
    const to = process.env.FEEDBACK_TO ?? 'hello@sonobuddy.com';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: senderEmail || undefined,
        subject: senderEmail
          ? `SonoBuddy Feedback from ${senderEmail}`
          : 'SonoBuddy App Feedback',
        text: body,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500, headers: CORS });
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    console.error('Feedback route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: CORS });
  }
}
