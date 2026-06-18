// POST /api/numbers/clear — deletes all records from Airtable
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TOKEN = process.env.AIRTABLE_TOKEN;

    // Fetch all record IDs
    const r = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/Numbers?fields[]=Phone`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );
    const data = await r.json();
    const ids = (data.records || []).map(rec => rec.id);

    // Delete in batches of 10 (Airtable limit)
    for (let i = 0; i < ids.length; i += 10) {
      const batch = ids.slice(i, i + 10);
      const params = batch.map(id => `records[]=${id}`).join('&');
      await fetch(`https://api.airtable.com/v0/${BASE_ID}/Numbers?${params}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
