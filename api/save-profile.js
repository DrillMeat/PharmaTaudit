export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { firstName, lastName, pharmacies, role } = req.body || {};
    
    // Validate required fields
    if (!firstName || !lastName || !pharmacies || !Array.isArray(pharmacies) || pharmacies.length === 0) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    
    // Validate role
    if (!['employee', 'rga'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    
    // Validate pharmacy count based on role
    const pharmacyLimits = {
      'employee': 1,
      'rga': 5
    };
    
    const maxPharmacies = pharmacyLimits[role];
    if (pharmacies.length > maxPharmacies) {
      res.status(400).json({ 
        error: `Maximum ${maxPharmacies} pharmacy${maxPharmacies > 1 ? 'ies' : ''} allowed for ${role}` 
      });
      return;
    }
    
    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';
    
    // Save profile data to database
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      pharmacies: pharmacies,
      role: role,
      created_at: new Date().toISOString()
    };
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Supabase error:', error);
      res.status(500).json({ 
        error: 'Failed to save profile', 
        details: error 
      });
      return;
    }
    
    res.status(200).json({ 
      ok: true, 
      message: 'Profile saved successfully',
      profile: {
        firstName,
        lastName,
        pharmacies,
        role
      }
    });
    
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
