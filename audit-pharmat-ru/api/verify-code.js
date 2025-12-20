export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    // Lookup code with better error handling
    const lookupUrl = `${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(email)}&code=eq.${encodeURIComponent(code)}&used=eq.false&select=*`;
    
    console.log('Looking up code for email:', email);
    
    const resp = await fetch(lookupUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const rows = await resp.json();
    
    if (!resp.ok) {
      console.error('Supabase lookup failed:', rows);
      res.status(resp.status).json({ 
        error: rows?.message || 'Database lookup failed', 
        details: rows 
      });
      return;
    }

    console.log('Found rows:', rows.length);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No matching code found for email:', email);
      res.status(400).json({ 
        error: 'Invalid or expired code',
        hint: 'Make sure you entered the correct 6-digit code'
      });
      return;
    }

    const row = rows[0];
    const now = new Date();
    const expiresAt = new Date(row.expires_at);
    
    console.log('Code expires at:', expiresAt);
    console.log('Current time:', now);
    
    if (expiresAt < now) {
      console.log('Code has expired');
      res.status(400).json({ 
        error: 'Code expired',
        hint: 'Please request a new verification code'
      });
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

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}


