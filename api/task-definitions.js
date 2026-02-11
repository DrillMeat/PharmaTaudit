import { getSession } from './_lib/session.js';
import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import { ROLE_RGA, requireAuth, requireRole } from './_lib/roles.js';

function slugify(value) {
  return `${value || ''}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export default async function handler(req, res) {
  try {
    const session = getSession(req);
    const authError = requireAuth(session);
    if (authError) {
      fail(res, authError.status, authError.message);
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    if (req.method === 'GET') {
      let url = `${SUPABASE_URL}/rest/v1/task_definitions?select=*`;
      url += '&is_active=eq.true';
      url += '&order=created_at.asc';

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Supabase get-task-definitions error:', text);
        fail(res, 500, text || 'Failed to fetch task definitions');
        return;
      }

      const tasks = await response.json();
      ok(res, { tasks });
      return;
    }

    if (req.method !== 'POST') {
      methodNotAllowed(res, ['GET', 'POST']);
      return;
    }

    const roleError = requireRole(session, ROLE_RGA);
    if (roleError) {
      fail(res, roleError.status, roleError.message);
      return;
    }

    const { action } = req.body || {};
    if (action === 'delete') {
      const { id } = req.body || {};
      if (!id) {
        fail(res, 400, 'Task id is required');
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/task_definitions?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          is_active: false,
          deleted_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Supabase delete-task-definition error:', text);
        fail(res, 500, text || 'Failed to delete task definition');
        return;
      }

      const data = await response.json();
      ok(res, { task: data?.[0] || null });
      return;
    }

    const { title, description, frequency, activeDate, pharmacyIndexes, dueTime, dueDate } = req.body || {};
    if (!title || !`${title}`.trim()) {
      fail(res, 400, 'Title is required');
      return;
    }

    const frequencyValue = frequency === 'one_time' ? 'one_time' : 'daily';
    const activeDateValue = frequencyValue === 'one_time' ? activeDate : null;
    if (frequencyValue === 'one_time' && !activeDateValue) {
      fail(res, 400, 'Active date is required for one-time tasks');
      return;
    }

    const keyBase = slugify(title);
    const taskKey = `${keyBase || 'task'}-${Date.now()}`;

    const sanitizedIndexes = Array.isArray(pharmacyIndexes)
      ? pharmacyIndexes.map(Number).filter(value => Number.isFinite(value))
      : [];

    const payload = {
      key: taskKey,
      title: `${title}`.trim(),
      description: `${description || ''}`.trim(),
      frequency: frequencyValue,
      active_date: activeDateValue || null,
      due_time: dueTime || null,
      due_date: dueDate || null,
      pharmacy_indexes: sanitizedIndexes.length ? sanitizedIndexes : null,
      created_by: session.email || null,
      is_active: true
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/task_definitions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase add-task-definition error:', text);
      fail(res, 500, text || 'Failed to add task definition');
      return;
    }

    const data = await response.json();
    ok(res, { task: data?.[0] || payload });
  } catch (error) {
    console.error('Task definitions error:', error);
    fail(res, 500, 'Internal server error');
  }
}

