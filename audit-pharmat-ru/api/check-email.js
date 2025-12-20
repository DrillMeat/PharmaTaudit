export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body || {};
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';
    
    // Check if email exists in users table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=email`, {
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
    const exists = users && users.length > 0;
    
    res.status(200).json({ exists });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
