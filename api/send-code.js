import { ok, fail, methodNotAllowed } from './_lib/respond.js';
import { CODE_EXPIRY_MINUTES, CODE_LENGTH } from './_lib/constants.js';

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { email } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      fail(res, 400, 'Valid email is required');
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      fail(res, 500, 'Server misconfigured: missing Supabase credentials');
      return;
    }

    const maxValue = 10 ** CODE_LENGTH;
    const minValue = 10 ** (CODE_LENGTH - 1);
    const code = Math.floor(minValue + Math.random() * (maxValue - minValue)).toString();
    const expires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

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
      console.error('Supabase save-code error:', err);
      fail(res, 500, 'Failed to save code');
      return;
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    
    if (RESEND_API_KEY) {
      try {
        const emailResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Audit PharmaT <code@pharmataudit.online>',
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
          ok(res, { 
            id: emailJson?.id,
            message: 'Verification code sent to your email',
            emailSent: true
          });
          return;
        } else {
          console.error('Email sending failed:', emailJson);
          ok(res, { 
            devCode: code, 
            emailError: emailJson,
            note: 'Email sending failed, showing code for testing. Check email configuration.'
          });
          return;
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        ok(res, { 
          devCode: code, 
          emailError: emailError.message,
          note: 'Email service unavailable, showing code for testing.'
        });
        return;
      }
    }

    ok(res, { 
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
    console.error('Send code error:', error);
    fail(res, 500, 'Internal server error');
  }
}

