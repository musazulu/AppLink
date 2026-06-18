const { createClient } = require('@libsql/client');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone } = req.body || {};
    if (!phone || !String(phone).trim()) return res.status(400).json({ error: 'Phone required' });

    const db = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    });

    // Create table if it doesn't exist
    await db.execute(`CREATE TABLE IF NOT EXISTS numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      ip TEXT,
      timestamp TEXT
    )`);

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '--';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    await db.execute({
      sql: 'INSERT INTO numbers (phone, ip, timestamp) VALUES (?, ?, ?)',
      args: [String(phone).trim(), ip, timestamp],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(200).json({ success: true });
  }
};
