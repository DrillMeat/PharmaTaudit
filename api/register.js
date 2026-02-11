import { setSessionCookie } from './_lib/session.js';
import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { role, email, password } = req.body || {};
    if (!role || !email || !password) {
      fail(res, 400, 'Missing role, email, or password');
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{ email, role, password_hash: passwordHash }])
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      fail(res, response.status, data?.message || 'Insert failed');
      return;
    }

    setSessionCookie(res, { email, role });
    ok(res, { data });
  } catch (error) {
    fail(res, 500, 'Internal server error');
  }
}


