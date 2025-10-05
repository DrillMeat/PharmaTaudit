# Email Verification Setup Guide

## Current Status
The email verification system is set up but requires configuration to send actual emails.

## What's Working
✅ Code generation and storage in Supabase  
✅ Code verification logic  
✅ Fallback development mode (shows code on screen)  
✅ Better error handling and user feedback  

## What Needs Setup
🔧 Email service configuration (Resend API)

## Setup Instructions

### Option 1: Use Resend (Recommended)
1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Set the environment variable: `RESEND_API_KEY=your_api_key_here`
4. For development, add test emails in Resend → Settings → Test emails
5. Redeploy your application

### Option 2: Use Development Mode
- The system will show verification codes on screen for testing
- No email configuration needed
- Perfect for development and testing

## Testing the System

### Manual Testing
1. Open `register.html` in your browser
2. Enter an email address
3. Click "Send verification code"
4. Check the response message:
   - If email is configured: "Verification code sent to your email!"
   - If not configured: Shows the code on screen with setup instructions

### Automated Testing
Run the test script:
```bash
node test-email.js
```

## Troubleshooting

### Common Issues
1. **"Email provider not configured"**
   - Set `RESEND_API_KEY` environment variable
   - Redeploy after setting the variable

2. **"Email sending failed"**
   - Check if recipient email is added to Resend test emails
   - Verify API key is correct
   - Check Resend dashboard for error logs

3. **"Invalid or expired code"**
   - Codes expire in 10 minutes
   - Request a new code if expired
   - Check Supabase connection

### Debug Information
- Check browser console for detailed error messages
- Check server logs for API call details
- Verify Supabase `email_codes` table has proper permissions

## Current Configuration
- **Email Service**: Resend (configurable)
- **Code Expiry**: 10 minutes
- **Code Length**: 6 digits
- **Database**: Supabase
- **Fallback**: Development mode with on-screen codes
