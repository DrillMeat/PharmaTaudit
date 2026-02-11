import { getSession } from './_lib/session.js';

export default async function handler(req, res) {
  try {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).json({ error: 'Server misconfigured: missing Supabase credentials' });
      return;
    }

    if (req.method === 'GET') {
      const { email } = session;
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Supabase get-profile error:', text);
        res.status(500).json({ error: 'Failed to fetch profile' });
        return;
      }

      const profiles = await response.json();
      if (!profiles || profiles.length === 0) {
        res.status(200).json({ ok: true, profile: null });
        return;
      }

      res.status(200).json({ ok: true, profile: profiles[0] });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const {
      firstName: camelFirstName,
      lastName: camelLastName,
      pharmacies,
      first_name: snakeFirstName,
      last_name: snakeLastName
    } = req.body || {};
    const { role, email } = session;

    const firstName = camelFirstName || snakeFirstName || '';
    const lastName = camelLastName || snakeLastName || '';

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

    if (!['employee', 'rga'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

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

    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=email`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const existingProfiles = checkResponse.ok ? await checkResponse.json() : [];
    const profileExists = existingProfiles && existingProfiles.length > 0;

    const profileData = {
      first_name: firstName,
      last_name: lastName,
      pharmacies: sanitizedPharmacies,
      role,
      email
    };

    if (!profileExists) {
      profileData.created_at = new Date().toISOString();
    }

    let response;
    if (profileExists) {
      response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(profileData)
      });
    } else {
      response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([profileData])
      });
    }

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

      if (response.status === 425 || response.status === 403 || (supabaseRaw && supabaseRaw.includes('row-level security'))) {
        res.status(500).json({
          error: 'Database security policy error. Please contact support or check your Supabase RLS policies for the profiles table.'
        });
        return;
      }

      res.status(response.status || 500).json({
        error: message
      });
      return;
    }

    const savedProfile = Array.isArray(supabaseJson) ? supabaseJson[0] : supabaseJson;

    res.status(200).json({
      ok: true,
      message: profileExists ? 'Profile updated successfully' : 'Profile saved successfully',
      profile: {
        firstName,
        lastName,
        pharmacies: sanitizedPharmacies,
        role,
        email,
        supabase: savedProfile
      }
    });
  } catch (error) {
    console.error('Profile handler error:', error);
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}

