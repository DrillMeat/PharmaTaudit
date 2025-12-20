export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, pharmacyIndex, taskKey } = req.body || {};

    if (!email || pharmacyIndex === undefined || !taskKey) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    const url = `${SUPABASE_URL}/rest/v1/task_submissions?employee_email=eq.${encodeURIComponent(email)}&pharmacy_index=eq.${encodeURIComponent(pharmacyIndex)}&task_key=eq.${encodeURIComponent(taskKey)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase delete-submission error:', text);
      res.status(500).json({ error: 'Failed to delete submission' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

