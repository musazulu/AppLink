// POST /api/submit
// Forwards phone number to a Google Apps Script Web App (free)
// Set GOOGLE_SCRIPT_URL env variable in Vercel to your Apps Script deployment URL
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone } = req.body || {};
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ error: 'Phone required' });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (scriptUrl) {
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || '--';
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      // Fire-and-forget — don't block the user redirect
      fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: String(phone).trim(), ip, timestamp }),
      }).catch(() => {});
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    // Always return success so the user gets redirected regardless
    return res.status(200).json({ success: true });
  }
};
