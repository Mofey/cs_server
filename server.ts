import dotenv from 'dotenv';
dotenv.config(); // Loads environment variables from .env file

import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

const app = express();

//JSON body parser middleware
app.use(express.json());

// MANUAL CORS MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});


const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true, // Use secure connection
  port: 465, // Gmail's secure SMTP port
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail app password (NOT your Gmail login password)
  },
});

app.post('/api/notify', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let client;
  try {
    client = await pool.connect(); // 👈 safe connection

    console.log('📝 Inserting email into DB...');
    await client.query(
      'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email]
    );

    console.log('📨 Sending admin notification...');
    await transporter.sendMail({
      from: 'Coming Soon <{process.env.GMAIL_USER}>',
      to: process.env.GMAIL_USER, // Admin email
      subject: 'New subscriber for site launch notification!',
      html: `<p><strong>${email}</strong> just subscribed!</p>`,
    });

    console.log('✅ Sending confirmation to ' + email );
    await transporter.sendMail({
      from: 'Coming Soon <{process.env.GMAIL_USER}>',
      to: email,
      subject: 'You’re subscribed!',
      html: '<p>Thanks for signing up! You’ll be notified when we launch.</p>',
    });

    console.log('🎉 All emails sent. Sending response...');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Notify error:', err);
    res.status(500).json({ error: 'Failed to save or send email' });
  } finally {
    if (client) client.release(); // 👈 release connection
  }
});


app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Server is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Needed for Vercel to use this file as an API handler
export default app;