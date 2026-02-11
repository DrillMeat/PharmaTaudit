import { getSession } from './_lib/session.js';
import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import { ROLE_RGA, requireAuth, requireRole } from './_lib/roles.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const session = getSession(req);
    const authError = requireAuth(session);
    if (authError) {
      fail(res, authError.status, authError.message);
      return;
    }
    const roleError = requireRole(session, ROLE_RGA);
    if (roleError) {
      fail(res, roleError.status, roleError.message);
      return;
    }

    const { employeeEmail, pharmacyIndex, taskKey, status, reviewNote } = req.body || {};
    const reviewerEmail = session.email;

    if (!employeeEmail || pharmacyIndex === undefined || !taskKey || !status) {
      fail(res, 400, 'Missing required fields');
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    const url = `${SUPABASE_URL}/rest/v1/task_submissions?employee_email=eq.${encodeURIComponent(employeeEmail)}&pharmacy_index=eq.${encodeURIComponent(pharmacyIndex)}&task_key=eq.${encodeURIComponent(taskKey)}`;

    const payload = {
      status,
      reviewer_email: reviewerEmail || null,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote || null
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
      fail(res, 500, 'Failed to update submission status');
      return;
    }

    const result = await response.json();
    ok(res, { submission: result?.[0] });
  } catch (error) {
    console.error('Update submission status error:', error);
    fail(res, 500, 'Internal server error');
  }
}

