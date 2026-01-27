const db = require('../config/database');

// Buat aduan
async function createComplaint(req, res) {
  const { title, message } = req.body;
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Judul dan pesan aduan wajib diisi' });
  }
  
  try {
    await db.query(
      'INSERT INTO complaints (user_id, title, message) VALUES (?, ?, ?)',
      [req.user.id, title, message]
    );
    res.json({ message: 'Aduan dikirim' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get semua aduan user
async function getComplaints(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createComplaint, getComplaints };

