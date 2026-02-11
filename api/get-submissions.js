function buildInFilter(values = []) {
  const sanitized = values
    .map(v => `${v}`.trim())
    .filter(Boolean)
    .map(v => encodeURIComponent(v));
  if (!sanitized.length) return null;
  return `(${sanitized.join(',')})`;
}

import { getSession } from './_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { pharmacies } = req.query || {};
    const role = session.role;
    const email = session.email;

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).json({ error: 'Server misconfigured: missing Supabase credentials' });
      return;
    }

    let url = `${SUPABASE_URL}/rest/v1/task_submissions?select=*`;

    if (role !== 'rga') {
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

