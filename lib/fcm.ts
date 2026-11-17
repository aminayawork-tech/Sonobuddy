import crypto from 'crypto';

/**
 * Minimal Firebase Cloud Messaging (HTTP v1) sender for the Android app's
 * daily push. Credentials come from the FCM_SERVICE_ACCOUNT env var: the full
 * service-account JSON downloaded from Firebase → Project settings → Service
 * accounts → Generate new private key.
 */
interface ServiceAccount { project_id: string; client_email: string; private_key: string }

export function fcmServiceAccount(): ServiceAccount | null {
  const raw = process.env.FCM_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.project_id || !sa.client_email || !sa.private_key) return null;
    // Vercel can store the key's newlines escaped.
    return { ...sa, private_key: sa.private_key.replace(/\\n/g, '\n') };
  } catch {
    return null;
  }
}

/** Exchanges a signed JWT for a short-lived OAuth access token. */
export async function fcmAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new Error(`fcm-auth:${body.error ?? res.status}`);
  return body.access_token as string;
}

export interface FcmResult { ok: boolean; reason: string | null; unregistered: boolean }

export async function sendOneFcm(
  sa: ServiceAccount,
  accessToken: string,
  deviceToken: string,
  msg: { title: string; body: string; url: string },
): Promise<FcmResult> {
  try {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: { title: msg.title, body: msg.body },
          data: { url: msg.url },
          android: {
            priority: 'high',
            notification: { channel_id: 'daily', icon: 'ic_stat_sonobuddy', color: '#0EA5E9' },
          },
        },
      }),
    });
    if (res.ok) return { ok: true, reason: null, unregistered: false };
    const body = await res.json().catch(() => ({}));
    const code: string =
      body?.error?.details?.find((d: { errorCode?: string }) => d.errorCode)?.errorCode ??
      body?.error?.status ?? `HTTP_${res.status}`;
    // UNREGISTERED: app uninstalled or token rotated. INVALID_ARGUMENT on a
    // token usually means it's malformed. Both are safe to drop.
    const unregistered = code === 'UNREGISTERED' || (res.status === 400 && code === 'INVALID_ARGUMENT');
    return { ok: false, reason: code, unregistered };
  } catch (err) {
    return { ok: false, reason: `req:${err instanceof Error ? err.message : String(err)}`, unregistered: false };
  }
}
