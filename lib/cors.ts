// lib/cors.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Wrap any Vercel handler to automatically:
 *  • set CORS headers
 *  • respond to OPTIONS preflights
 */
export function withCors(
  handler: (req: VercelRequest, res: VercelResponse) => any | Promise<any>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // 1) CORS headers
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2) Preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // 3) Your real handler
    return handler(req, res);
  };
}
