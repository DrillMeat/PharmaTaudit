// Test script for email verification system
// Run with: node test-email.js

const testEmail = async () => {
  const testEmailAddress = 'test@example.com';
  
  console.log('🧪 Testing email verification system...');
  console.log('📧 Test email:', testEmailAddress);
  
  try {
    // Test sending code
    console.log('\n1️⃣ Testing send-code endpoint...');
    const sendResponse = await fetch('http://localhost:3000/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmailAddress })
    });
    
    const sendResult = await sendResponse.json();
    console.log('📤 Send response status:', sendResponse.status);
    console.log('📤 Send response:', JSON.stringify(sendResult, null, 2));
    
    if (sendResult.devCode) {
      console.log('\n2️⃣ Testing verify-code endpoint...');
      const verifyResponse = await fetch('http://localhost:3000/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmailAddress, 
          code: sendResult.devCode 
        })
      });
      
      const verifyResult = await verifyResponse.json();
      console.log('✅ Verify response status:', verifyResponse.status);
      console.log('✅ Verify response:', JSON.stringify(verifyResult, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  const fetch = require('node-fetch');
  testEmail();
} else {
  // Browser environment
  testEmail();
}
