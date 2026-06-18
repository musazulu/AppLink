// POST /api/submit
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

      // Send as URL params via GET — Google Apps Script handles this reliably
      const url = new URL(scriptUrl);
      url.searchParams.set('phone', String(phone).trim());
      url.searchParams.set('ip', ip);
      url.searchParams.set('timestamp', timestamp);

      try {
        await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
      } catch (e) {
        console.error('Script error:', e.message);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(200).json({ success: true });
  }
};
