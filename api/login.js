import { setSessionCookie } from './_lib/session.js';
import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      fail(res, 400, 'Email and password are required');
      return;
    }
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }
    
    // Look up user by email
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
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
    
    if (!users || users.length === 0) {
      fail(res, 401, 'Invalid email or password');
      return;
    }
    
    const user = users[0];
    
    if (!user.password_hash) {
      fail(res, 401, 'Invalid email or password');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      fail(res, 401, 'Invalid email or password');
      return;
    }
    
    setSessionCookie(res, { email: user.email, role: user.role });

    ok(res, {
      message: 'Login successful',
      role: user.role,
      email: user.email
    });
    
  } catch (error) {
    console.error('Login error:', error);
    fail(res, 500, 'Internal server error');
  }
}
