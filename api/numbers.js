const { createClient } = require('@libsql/client');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    });

    await db.execute(`CREATE TABLE IF NOT EXISTS numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      ip TEXT,
      timestamp TEXT
    )`);

    const result = await db.execute('SELECT phone, ip, timestamp FROM numbers ORDER BY id DESC LIMIT 1000');
    const records = result.rows.map(r => ({ phone: r[0], ip: r[1], timestamp: r[2] }));
    return res.status(200).json(records);
  } catch (err) {
    console.error('Numbers error:', err.message);
    return res.status(200).json([]);
  }
};
