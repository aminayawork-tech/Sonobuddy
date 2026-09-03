import { NextRequest, NextResponse } from 'next/server';
import { redisConfig, redisCommand } from '@/lib/redis';

export const runtime = 'edge';

// Reachable from the marketing site and, in future, the app — same cross-origin
// setup as the feedback route.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const LIST_KEY = 'waitlist:android';

function validEmail(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const e = v.trim();
  return e.length >= 5 && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!validEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400, headers: CORS }
      );
    }

    const address = email.trim().toLowerCase();
    const cfg = redisConfig();

    // Store first. The signup is the thing that matters — if the notification
    // email fails later, the address is still captured.
    let isNew = true;
    if (cfg) {
      try {
        const added = await redisCommand(cfg, ['SADD', LIST_KEY, address]);
        isNew = Number(added) === 1;
      } catch (err) {
        console.error('Waitlist store failed:', err);
        // Fall through to the notification so the signup isn't lost entirely.
      }
    }

    // Already on the list: report success without sending a duplicate email.
    if (!isNew) {
      return NextResponse.json({ ok: true, already: true }, { headers: CORS });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const from = process.env.FEEDBACK_FROM ?? 'SonoBuddy <feedback@sonobuddy.com>';
      const to = process.env.FEEDBACK_TO ?? 'hello@sonobuddy.com';
      let total: number | null = null;
      if (cfg) {
        try { total = Number(await redisCommand(cfg, ['SCARD', LIST_KEY])); } catch { /* best effort */ }
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          reply_to: address,
          subject: 'New Android waitlist signup',
          text: `${address} joined the Android waitlist.${total ? `\n\nTotal on the list: ${total}` : ''}`,
        }),
      });

      if (!res.ok) {
        console.error('Waitlist notification failed:', res.status, await res.text());
        // The address is stored, so this is still a success for the visitor.
      }
    }

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    console.error('Waitlist route error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500, headers: CORS });
  }
}
