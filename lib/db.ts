// lib/db.ts
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// ensure dotenv loads locally
import 'dotenv/config';

export const pool = new Pool({
  host:     process.env.PGHOST,
  database: process.env.PGDATABASE,
  user:     process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port:     Number(process.env.PGPORT) || 5432,
  ssl:      { rejectUnauthorized: false },
});

export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_PASS!,
  },
});
