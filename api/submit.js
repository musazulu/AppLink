module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone } = req.body || {};
    if (!phone || !String(phone).trim()) return res.status(400).json({ error: 'Phone required' });

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '--';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const TURSO_URL = process.env.TURSO_URL;
    const TURSO_TOKEN = process.env.TURSO_TOKEN;

    // Use Turso HTTP API directly — no npm package needed
    await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: 'CREATE TABLE IF NOT EXISTS numbers (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, ip TEXT, timestamp TEXT)'
            }
          },
          {
            type: 'execute',
            stmt: {
              sql: 'INSERT INTO numbers (phone, ip, timestamp) VALUES (?, ?, ?)',
              args: [
                { type: 'text', value: String(phone).trim() },
                { type: 'text', value: ip },
                { type: 'text', value: timestamp },
              ]
            }
          },
          { type: 'close' }
        ]
      }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(200).json({ success: true });
  }
};
