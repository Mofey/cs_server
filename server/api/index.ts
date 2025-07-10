import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from '../../lib/cors';

async function handler(req: VercelRequest, res: VercelResponse) {
  // For a preflight
  if (req.method === 'OPTIONS') return res.status(204).end();
  res.status(200).send('🚀 Serverless function is live!');
}

export default withCors(handler);