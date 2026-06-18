// POST /api/submit — saves phone number to Airtable
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

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '--';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TOKEN = process.env.AIRTABLE_TOKEN;

    await fetch(`https://api.airtable.com/v0/${BASE_ID}/Numbers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            Phone: String(phone).trim(),
            IP: ip,
            Timestamp: timestamp,
          }
        }]
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ success: true });
  }
};
