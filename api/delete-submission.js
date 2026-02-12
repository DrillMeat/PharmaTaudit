import { getSession } from './_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (session.role !== 'employee') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { pharmacyIndex, taskKey } = req.body || {};
    const email = session.email;

    if (!email || pharmacyIndex === undefined || !taskKey) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).json({ error: 'Server misconfigured: missing Supabase credentials' });
      return;
    }

    const url = `${SUPABASE_URL}/rest/v1/task_submissions?employee_email=eq.${encodeURIComponent(email)}&pharmacy_index=eq.${encodeURIComponent(pharmacyIndex)}&task_key=eq.${encodeURIComponent(taskKey)}`;

    // Fetch the submission first to get the file_url for storage cleanup
    const getResp = await fetch(`${url}&select=file_url`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const rows = getResp.ok ? await getResp.json().catch(() => []) : [];

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

    // Clean up file from Storage if it's a storage URL
    for (const row of rows) {
      if (row.file_url && row.file_url.includes('/storage/v1/object/public/submissions/')) {
        const storagePath = row.file_url.split('/storage/v1/object/public/submissions/')[1];
        if (storagePath) {
          await fetch(`${SUPABASE_URL}/storage/v1/object/submissions/${storagePath}`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }).catch(() => {});
        }
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

