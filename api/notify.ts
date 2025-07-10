// api/notify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../lib/cors';
import { pool, mailer } from '../lib/db';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST (preflight is handled by withCors)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Store subscriber
    await pool.query(
      'INSERT INTO subscribers(email) VALUES($1) ON CONFLICT(email) DO NOTHING',
      [email]
    );

    // Notify you
    await mailer.sendMail({
      from:    `"Coming Soon" <${process.env.GMAIL_USER}>`,
      to:      'mohfey@gmail.com',
      subject: 'New subscriber for site launch!',
      text:    `A new user signed up: ${email}`,
      html:    `<p>New subscriber: <strong>${email}</strong></p>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: 'Failed to save or send email' });
  }
}

export default withCors(handler);
