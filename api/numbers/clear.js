const { createClient } = require('@libsql/client');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_TOKEN,
    });
    await db.execute('DELETE FROM numbers');
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Clear error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};
