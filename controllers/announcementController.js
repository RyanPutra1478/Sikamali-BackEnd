const db = require('../config/database');
const logController = require('./logController');

// Get All (Untuk Dashboard & Admin List)
async function getAnnouncements(req, res) {
  try {
    // Ambil pengumuman terbaru, join dengan user untuk tahu siapa yg buat
    const [rows] = await db.query(`
      SELECT a.*, u.nama as author_name 
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create (Admin Only)
async function createAnnouncement(req, res) {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Judul dan isi wajib diisi' });

  try {
    const [result] = await db.query(
      'INSERT INTO announcements (title, content, created_by) VALUES (?, ?, ?)',
      [title, content, req.user.id]
    );
    const announcementId = result.insertId;
    await logController.createLog(req.user.id, 'CREATE', 'ANNOUNCEMENT', announcementId, { title }, req.ip);
    res.json({ message: 'Pengumuman berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete (Admin Only)
async function deleteAnnouncement(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT title FROM announcements WHERE id = ?', [id]);
    const title = rows.length > 0 ? rows[0].title : 'Unknown';

    await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    await logController.createLog(req.user.id, 'DELETE', 'ANNOUNCEMENT', id, { title }, req.ip);
    res.json({ message: 'Pengumuman dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Toggle Active Status (Opsional: Sembunyikan tanpa hapus)
async function toggleStatus(req, res) {
  const { id } = req.params;
  try {
    // Toggle 1 ke 0, atau 0 ke 1
    await db.query('UPDATE announcements SET is_active = NOT is_active WHERE id = ?', [id]);
    const [rows] = await db.query('SELECT title, is_active FROM announcements WHERE id = ?', [id]);

    await logController.createLog(req.user.id, 'UPDATE_STATUS', 'ANNOUNCEMENT', id, { title: rows[0].title, is_active: rows[0].is_active }, req.ip);

    res.json({ message: 'Status diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement, toggleStatus };