export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { employeeEmail, pharmacyIndex, taskKey, status, reviewerEmail } = req.body || {};

    if (!employeeEmail || pharmacyIndex === undefined || !taskKey || !status) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    const url = `${SUPABASE_URL}/rest/v1/task_submissions?employee_email=eq.${encodeURIComponent(employeeEmail)}&pharmacy_index=eq.${encodeURIComponent(pharmacyIndex)}&task_key=eq.${encodeURIComponent(taskKey)}`;

    const payload = {
      status,
      reviewer_email: reviewerEmail || null,
      reviewed_at: new Date().toISOString()
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase update-submission-status error:', text);
      res.status(500).json({ error: 'Failed to update submission status' });
      return;
    }

    const result = await response.json();
    res.status(200).json({ ok: true, submission: result?.[0] });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

