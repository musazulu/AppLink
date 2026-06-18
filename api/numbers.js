module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const TURSO_URL = process.env.TURSO_URL;
    const TURSO_TOKEN = process.env.TURSO_TOKEN;

    if (!TURSO_URL || !TURSO_TOKEN) {
      return res.status(200).json({ error: 'Missing env vars', url: !!TURSO_URL, token: !!TURSO_TOKEN });
    }

    const r = await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: { sql: 'CREATE TABLE IF NOT EXISTS numbers (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, ip TEXT, timestamp TEXT)' }
          },
          {
            type: 'execute',
            stmt: { sql: 'SELECT phone, ip, timestamp FROM numbers ORDER BY id DESC LIMIT 1000' }
          },
          { type: 'close' }
        ]
      }),
    });

    const data = await r.json();
    const rows = data.results?.[1]?.response?.result?.rows || [];
    const records = rows.map(row => ({
      phone: row[0]?.value || '--',
      ip: row[1]?.value || '--',
      timestamp: row[2]?.value || '--',
    }));

    return res.status(200).json(records);
  } catch (err) {
    console.error('Numbers error:', err.message);
    return res.status(200).json([]);
  }
};
