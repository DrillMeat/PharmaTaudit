import { getSession } from './_lib/session.js';
import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import { ROLE_EMPLOYEE, requireAuth, requireRole } from './_lib/roles.js';
import { MAX_SUBMISSION_PAYLOAD_BYTES } from './_lib/constants.js';

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
    const roleError = requireRole(session, ROLE_EMPLOYEE);
    if (roleError) {
      fail(res, roleError.status, roleError.message);
      return;
    }

    const { pharmacyIndex, taskKey, fileName, fileUrl } = req.body || {};
    const email = session.email;

    if (!email || pharmacyIndex === undefined || !taskKey || !fileUrl) {
      fail(res, 400, 'Missing required fields');
      return;
    }
    if (typeof fileUrl !== 'string') {
      fail(res, 400, 'Invalid file payload');
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    const payloadBytes = Buffer.byteLength(fileUrl, 'utf8');
    if (payloadBytes > maxPayloadBytes) {
      fail(res, 413, 'File payload too large. Please upload a smaller image.');
      return;
    }

    const payload = [{
      employee_email: email,
      pharmacy_index: pharmacyIndex,
      task_key: taskKey,
      status: 'waiting',
      file_name: fileName || '',
      file_url: fileUrl,
      updated_at: new Date().toISOString()
    }];

    const response = await fetch(`${SUPABASE_URL}/rest/v1/task_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase save-submission error:', text);
      fail(res, 500, 'Failed to save submission');
      return;
    }

    const result = await response.json();
    ok(res, { submission: result?.[0] });
  } catch (error) {
    console.error('Save submission error:', error);
    fail(res, 500, 'Internal server error');
  }
}

