import { ok, fail, methodNotAllowed } from './_lib/respond.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { email } = req.body || {};
    
    if (!email) {
      fail(res, 400, 'Email is required');
      return;
    }
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }
    
    // Check if email exists in users table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=email`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error:', response.status, errorText);
      
      // Check if project might be paused
      if (response.status === 503 || response.status === 502) {
        fail(res, 503, 'Database service unavailable. Your Supabase project may be paused. Please check your Supabase dashboard and restart the project if needed.');
        return;
      }
      
      fail(res, 500, `Database error: ${errorText || 'Unknown error'}`);
      return;
    }
    
    const users = await response.json();
    const exists = users && users.length > 0;
    
    ok(res, { exists });
    
  } catch (error) {
    console.error('Check email error:', error);
    fail(res, 500, 'Internal server error');
  }
}
