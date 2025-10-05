export default async function handler(req, res) {
  console.log('=== SEND CODE API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Upsert code for this email
    const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/email_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify([{ email, code, expires_at: expires, used: false }])
    });

    if (!upsertResp.ok) {
      const err = await upsertResp.json().catch(() => ({}));
      res.status(500).json({ error: 'Failed to save code', details: err });
      return;
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', RESEND_API_KEY ? RESEND_API_KEY.length : 0);
    
    // Always try to send email first, with better error handling
    if (RESEND_API_KEY) {
      try {
        const emailResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'PharmaT Audit <onboarding@resend.dev>',
            to: [email],
            subject: 'Your PharmaT verification code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2d5a27;">PharmaT Audit Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #2d5a27; border-radius: 8px; margin: 20px 0;">
                  ${code}
                </div>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
            `,
            text: `Your PharmaT verification code is: ${code}. It expires in 10 minutes.`
          })
        });
        
        const emailJson = await emailResp.json().catch(() => ({}));
        
        if (emailResp.ok) {
          console.log('Email sent successfully:', emailJson);
          res.status(200).json({ 
            ok: true, 
            id: emailJson?.id,
            message: 'Verification code sent to your email',
            emailSent: true
          });
          return;
        } else {
          console.error('Email sending failed:', emailJson);
          // Don't fail completely, show dev code as fallback
          res.status(200).json({ 
            ok: true, 
            devCode: code, 
            emailError: emailJson,
            note: 'Email sending failed, showing code for testing. Check email configuration.'
          });
          return;
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Don't fail completely, show dev code as fallback
        res.status(200).json({ 
          ok: true, 
          devCode: code, 
          emailError: emailError.message,
          note: 'Email service unavailable, showing code for testing.'
        });
        return;
      }
    }

    // Dev fallback when email provider not configured
    console.log('Using dev fallback - no RESEND_API_KEY or email failed');
    console.log('Generated code:', code);
    res.status(200).json({ 
      ok: true, 
      devCode: code, 
      message: 'Development mode - code shown below',
      note: 'Email provider not configured. Set RESEND_API_KEY environment variable to enable email sending.',
      setupInstructions: [
        '1. Sign up for Resend at https://resend.com',
        '2. Get your API key from the dashboard',
        '3. Set RESEND_API_KEY environment variable',
        '4. Add test emails in Resend settings if using onboarding@resend.dev'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error' });
  }
}


