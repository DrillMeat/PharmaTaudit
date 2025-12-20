export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';
    
    // Simple test query to check if Supabase is accessible
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1&select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(200).json({
        connected: false,
        status,
        statusText,
        error: errorText,
        message: status === 503 || status === 502 
          ? 'Supabase project appears to be paused. Please restart it in your Supabase dashboard.'
          : 'Connection failed. Check your Supabase project status.'
      });
    }
    
    res.status(200).json({
      connected: true,
      status,
      statusText,
      message: 'Successfully connected to Supabase!',
      supabaseUrl: SUPABASE_URL
    });
    
  } catch (error) {
    res.status(200).json({
      connected: false,
      error: error.message,
      message: 'Failed to connect to Supabase. Check network connectivity and project status.'
    });
  }
}

