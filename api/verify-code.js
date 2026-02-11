import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import { CODE_LENGTH } from './_lib/constants.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      fail(res, 400, 'Email and code are required');
      return;
    }
    if (!/^[0-9]+$/.test(`${code}`) || `${code}`.length !== CODE_LENGTH) {
      fail(res, 400, 'Invalid or expired code');
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    // Lookup code with better error handling
    const lookupUrl = `${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}&code=eq.${encodeURIComponent(code)}&used=eq.false&select=*`;
    
    
    const resp = await fetch(lookupUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const rows = await resp.json();
    
    if (!resp.ok) {
      console.error('Supabase lookup failed:', rows);
      fail(res, resp.status, rows?.message || 'Database lookup failed');
      return;
    }


    if (!Array.isArray(rows) || rows.length === 0) {
      fail(res, 400, 'Invalid or expired code');
      return;
    }

    const row = rows[0];
    const now = new Date();
    const expiresAt = new Date(row.expires_at);
    
    
    if (expiresAt < now) {
      fail(res, 400, 'Code expired');
      return;
    }

    // Mark used
    await fetch(`${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ used: true })
    });

    ok(res);
  } catch (error) {
    console.error('Verify code error:', error);
    fail(res, 500, 'Internal server error');
  }
}


