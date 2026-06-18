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

    console.log('BASE_ID:', BASE_ID ? 'set' : 'MISSING');
    console.log('TOKEN:', TOKEN ? 'set' : 'MISSING');

    const airtableRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Numbers`, {
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

    const airtableData = await airtableRes.json();
    console.log('Airtable response:', JSON.stringify(airtableData));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(200).json({ success: true });
  }
};
