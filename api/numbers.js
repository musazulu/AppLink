// GET /api/numbers
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return res.status(200).json([]);

    const url = new URL(scriptUrl);
    url.searchParams.set('action', 'list');
    const r = await fetch(url.toString(), { redirect: 'follow' });
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err) {
    return res.status(200).json([]);
  }
};
