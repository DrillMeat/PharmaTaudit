import { getSession } from './_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  res.status(200).json({
    ok: true,
    session: {
      email: session.email,
      role: session.role,
      exp: session.exp
    }
  });
}

