export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Upsert code for this email
    const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/email_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify([{ email, code, expires_at: expires, used: false }])
    });

    if (!upsertResp.ok) {
      const err = await upsertResp.json().catch(() => ({}));
      res.status(500).json({ error: 'Failed to save code', details: err });
      return;
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'PharmaT Audit <no-reply@pharmat.example>',
          to: [email],
          subject: 'Your PharmaT verification code',
          text: `Your verification code is: ${code}. It expires in 10 minutes.`
        })
      });
      res.status(200).json({ ok: true });
      return;
    }

    // Dev fallback when email provider not configured
    res.status(200).json({ ok: true, devCode: code, note: 'Email provider not configured; showing code for testing' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}


