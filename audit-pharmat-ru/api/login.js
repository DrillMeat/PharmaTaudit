export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';
    
    // Look up user by email
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      console.error('Supabase error:', await response.text());
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    const users = await response.json();
    
    if (!users || users.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    const user = users[0];
    
    // Check password based on role
    const correctPasswords = {
      'rga': 'Sosiska1',
      'employee': 'Sosiska2'
    };
    
    const expectedPassword = correctPasswords[user.role];
    if (!expectedPassword || password !== expectedPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    
    res.status(200).json({ 
      ok: true, 
      message: 'Login successful',
      role: user.role,
      email: user.email
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
