export default async function handler(req, res) {
  console.log('=== TEST SEND CODE API CALLED ===');
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body || {};
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Generated code:', code);
    console.log('Email:', email);
    
    res.status(200).json({ 
      ok: true, 
      devCode: code, 
      message: 'Test API working - code generated',
      email: email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ error: error.message || 'Test API error' });
  }
}
