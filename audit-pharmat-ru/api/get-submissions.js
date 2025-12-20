function buildInFilter(values = []) {
  const sanitized = values
    .map(v => `${v}`.trim())
    .filter(Boolean)
    .map(v => encodeURIComponent(v));
  if (!sanitized.length) return null;
  return `(${sanitized.join(',')})`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, pharmacies, role } = req.query || {};

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    let url = `${SUPABASE_URL}/rest/v1/task_submissions?select=*`;

    if (email && (!role || role === 'employee')) {
      url += `&employee_email=eq.${encodeURIComponent(email)}`;
    }

    if (pharmacies) {
      const inFilter = buildInFilter(Array.isArray(pharmacies) ? pharmacies : `${pharmacies}`.split(','));
      if (inFilter) {
        url += `&pharmacy_index=in.${inFilter}`;
      }
    }

    url += '&order=updated_at.desc';

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase get-submissions error:', text);
      res.status(500).json({ error: 'Failed to fetch submissions' });
      return;
    }

    const submissions = await response.json();
    res.status(200).json({ ok: true, submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

