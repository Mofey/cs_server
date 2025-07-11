import dotenv from 'dotenv';
dotenv.config(); // Loads environment variables from .env file

import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

const app = express();

//JSON body parser middleware
app.use(express.json());

// —————— 1) MANUAL CORS MIDDLEWARE ——————
app.use((req: Request, res: Response, next: NextFunction) => {
  // allow your front‑end origin
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');  
  // allow these methods
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');      
  // allow this header
  res.header('Access-Control-Allow-Headers', 'Content-Type');          
  // if it’s a preflight OPTIONS request, end right here:
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
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail app password (NOT your Gmail login password)
  },
});

app.post('/api/notify', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // Store the user's email in the database
    await pool.query(
      'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email]
    );

    // Notify mohfey@gmail.com about the new subscriber
    await transporter.sendMail({
      from: `"Coming Soon" <${process.env.GMAIL_USER}>`,
      to: 'mohfey@gmail.com',
      subject: 'New subscriber for site launch notification!',
      text: `A new user has signed up to be notified: ${email}`,
      html: `<p>A new user has signed up to be notified: <strong>${email}</strong></p>`,
    });

    // (Optional) Send a confirmation to the user
    // await transporter.sendMail({
    //   from: `"Coming Soon" <${process.env.GMAIL_USER}>`,
    //   to: email,
    //   subject: 'You’ll be notified when we launch!',
    //   text: 'Thanks for signing up! We’ll let you know as soon as the new site is live.',
    //   html: '<p>Thanks for signing up! We’ll let you know as soon as the new site is live.</p>',
    // });

    res.json({ success: true });
  } catch (err) {
    console.error('Notify error:', err);
    res.status(500).json({ error: 'Failed to save or send email' });
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