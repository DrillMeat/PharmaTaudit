export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      firstName: camelFirstName,
      lastName: camelLastName,
      pharmacies,
      role,
      email,
      first_name: snakeFirstName,
      last_name: snakeLastName
    } = req.body || {};
    
    const firstName = camelFirstName || snakeFirstName || '';
    const lastName = camelLastName || snakeLastName || '';
    
    // Validate required fields
    const sanitizedPharmacies = Array.isArray(pharmacies)
      ? pharmacies.map(({ index, region, address, phone, hours }) => ({
          index,
          region,
          address,
          phone,
          hours
        })).filter(p => typeof p.index !== 'undefined')
      : [];
    
    if (!firstName || !lastName || sanitizedPharmacies.length === 0) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    
    // Validate role
    if (!['employee', 'rga'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    
    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';
    
    // Validate pharmacy count based on role
    const pharmacyLimits = {
      'employee': 1,
      'rga': 5
    };
    
    const maxPharmacies = pharmacyLimits[role];
    if (sanitizedPharmacies.length > maxPharmacies) {
      res.status(400).json({ 
        error: `Maximum ${maxPharmacies} pharmacy${maxPharmacies > 1 ? 'ies' : ''} allowed for ${role}` 
      });
      return;
    }
    
    // Save profile data to database
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      pharmacies: sanitizedPharmacies,
      role,
      email,
      created_at: new Date().toISOString()
    };
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(profileData)
    });
    
    const supabaseRaw = await response.text();
    let supabaseJson = null;
    if (supabaseRaw) {
      try {
        supabaseJson = JSON.parse(supabaseRaw);
      } catch (parseErr) {
        console.error('Supabase response parse error:', parseErr, supabaseRaw);
      }
    }
    
    if (!response.ok) {
      console.error('Supabase error:', response.status, supabaseJson || supabaseRaw);
      const message = supabaseJson?.message || supabaseJson?.error || supabaseRaw || 'Failed to save profile';
      res.status(response.status || 500).json({ 
        error: message 
      });
      return;
    }
    
    res.status(200).json({ 
      ok: true, 
      message: 'Profile saved successfully',
      profile: {
        firstName,
        lastName,
        pharmacies: sanitizedPharmacies,
        role,
        email,
        supabase: supabaseJson
      }
    });
    
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}
