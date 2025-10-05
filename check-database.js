// Database verification script
// This script checks if the email_codes table is properly set up

const SUPABASE_URL = 'https://xsrppkeysfjkxkbpfbog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcnBwa2V5c2Zqa3hrYnBmYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDI2NjcsImV4cCI6MjA3NDkxODY2N30.sLZtdQ80_Q-OlX7wD4bDoaLEVOBBMF7Qfga_Ju299t8';

const checkDatabase = async () => {
  console.log('🔍 Checking Supabase email_codes table...');
  
  try {
    // Test basic connection
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_codes?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Database connection successful');
      
      // Test inserting a test record
      const testEmail = 'test@example.com';
      const testCode = '123456';
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([{
          email: testEmail,
          code: testCode,
          expires_at: expires,
          used: false
        }])
      });
      
      if (insertResponse.ok) {
        console.log('✅ Test record inserted successfully');
        
        // Test reading the record
        const readResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(testEmail)}&select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (readResponse.ok) {
          const data = await readResponse.json();
          console.log('✅ Test record retrieved successfully');
          console.log('📊 Record data:', data);
          
          // Clean up test record
          const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_codes?email=eq.${encodeURIComponent(testEmail)}`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          });
          
          if (deleteResponse.ok) {
            console.log('✅ Test record cleaned up');
          }
        } else {
          console.log('❌ Failed to read test record');
        }
      } else {
        const error = await insertResponse.json().catch(() => ({}));
        console.log('❌ Failed to insert test record:', error);
      }
    } else {
      const error = await testResponse.json().catch(() => ({}));
      console.log('❌ Database connection failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
};

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  checkDatabase();
} else {
  // Browser environment
  checkDatabase();
}
