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

    // Until sonobuddy.com is verified at resend.com/domains, Resend's sandbox
    // only delivers to the account owner's own address and rejects anything
    // else with a 403. Once the domain is verified, set FEEDBACK_FROM to an
    // address on it and FEEDBACK_TO to hello@sonobuddy.com in Vercel — no code
    // change needed.
    const from = process.env.FEEDBACK_FROM ?? 'SonoBuddy Feedback <onboarding@resend.dev>';
    const to = process.env.FEEDBACK_TO ?? 'aminayawork@gmail.com';

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
