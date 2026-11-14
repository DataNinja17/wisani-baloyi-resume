import { createHash } from 'node:crypto';

const recipientEmail = 'wisanibaloyi65@gmail.com';
const requiredSettings = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL'];

function reply(status, message) {
  return Response.json({ ok: status === 200, message }, {
    status, headers: { 'Cache-Control': 'no-store' }
  });
}

export async function handleContact(request, env, journal, send = fetch) {
  if (request.method !== 'POST') return reply(405, 'Submit the contact form to send a message.');
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply(403, 'Please submit from this site.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415, 'Expected a form submission.');
  if (Number(request.headers.get('content-length')) > 8192) return reply(413, 'The message is too long.');
  let fields;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 8192) return reply(413, 'The message is too long.');
    fields = JSON.parse(body);
  } catch { return reply(400, 'The submission could not be read.'); }
  if (!fields || typeof fields !== 'object') return reply(400, 'Invalid submission.');
  const { id, name, email, message } = fields;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id) ||
      typeof name !== 'string' || !name.trim() || name.length > 80 || /[\r\n]/.test(name) ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof message !== 'string' || !message.trim() || message.length > 640) {
    return reply(400, 'Please check your name, email address and message.');
  }
  if (requiredSettings.some(key => !env[key])) {
    return reply(503, 'The contact form is awaiting activation. You can reach me using the email or WhatsApp link above.');
  }

  const fingerprint = createHash('sha256').update(JSON.stringify([id, name, email, message])).digest('hex');
  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': fingerprint },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL, to: [recipientEmail], reply_to: email,
        subject: 'Portfolio enquiry from ' + name.trim(),
        text: name.trim() + ' <' + email + '>\n\n' + message.trim()
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (response.ok) return reply(200, 'Message submitted.');
  } catch {
    // Reuse the same idempotency key if the visitor retries.
  }
  return reply(502, 'Email submission could not be confirmed. Please try again.');
}