// GET /api/numbers — reads all numbers from Airtable
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TOKEN = process.env.AIRTABLE_TOKEN;

    const r = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/Numbers?sort[0][field]=Timestamp&sort[0][direction]=desc&pageSize=100`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );

    const data = await r.json();
    const records = (data.records || []).map(rec => ({
      phone: rec.fields.Phone || '--',
      ip: rec.fields.IP || '--',
      timestamp: rec.fields.Timestamp || '--',
    }));

    return res.status(200).json(records);
  } catch (err) {
    console.error(err);
    return res.status(200).json([]);
  }
};
