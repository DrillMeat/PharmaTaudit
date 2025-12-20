export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.query || {};
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase get-profile error:', text);
      res.status(500).json({ error: 'Failed to fetch profile' });
      return;
    }

    const profiles = await response.json();
    if (!profiles || profiles.length === 0) {
      res.status(200).json({ ok: true, profile: null });
      return;
    }

    res.status(200).json({ ok: true, profile: profiles[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

