import type { IncomingMessage } from 'http';

// Simple proxy serverless function for Vercel that forwards /api/* requests
// to an external backend URL defined by BACKEND_URL or VITE_API_BASE_URL env var.

function toBuffer(body: any) {
  if (!body) return undefined;
  if (typeof body === 'string' || body instanceof Uint8Array) return body;
  return JSON.stringify(body);
}

export default async function handler(req: any, res: any) {
  try {
    const backendBase = process.env.BACKEND_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3001';

    const pathParts = req.query && req.query.path ? req.query.path : [];
    const path = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '');

    const url = `${backendBase.replace(/\/$/, '')}/${path}`;

    const headers: Record<string, string> = { ...req.headers };
    delete headers.host;

    let body = undefined;
    if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      body = toBuffer(req.body);
      if (body && !headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
    }

    const fetchRes = await fetch(url, {
      method: req.method,
      headers,
      body
    });

    // Forward status and headers
    res.status(fetchRes.status);
    fetchRes.headers.forEach((value: string, key: string) => {
      // Avoid overriding Vercel internal headers
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    const contentType = fetchRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await fetchRes.json().catch(() => null);
      return res.send(data);
    }

    const text = await fetchRes.text().catch(() => '');
    return res.send(text);
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad gateway', details: err?.message });
  }
}
