const db = require('../config/database');

// Get all zones
const getZones = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM zones ORDER BY created_at DESC');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data zona'
    });
  }
};

// Create zone
const createZone = async (req, res) => {
  const { nama_zona, kode_zona, keterangan, status, koordinat } = req.body;

  if (!nama_zona || !kode_zona) {
    return res.status(400).json({
      success: false,
      error: 'Nama zona dan kode zona wajib diisi'
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO zones (nama_zona, kode_zona, keterangan, status, koordinat) VALUES (?, ?, ?, ?, ?)',
      [nama_zona, kode_zona, keterangan, status || 'active', koordinat]
    );

    const [newZone] = await db.query('SELECT * FROM zones WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Zona berhasil ditambahkan',
      data: newZone[0]
    });
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menambahkan zona'
    });
  }
};

// Update zone
const updateZone = async (req, res) => {
  const { id } = req.params;
  const { nama_zona, kode_zona, keterangan, status, koordinat } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM zones WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Zona tidak ditemukan'
      });
    }

    await db.query(
      'UPDATE zones SET nama_zona = ?, kode_zona = ?, keterangan = ?, status = ?, koordinat = ? WHERE id = ?',
      [nama_zona, kode_zona, keterangan, status, koordinat, id]
    );

    const [updated] = await db.query('SELECT * FROM zones WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Zona berhasil diperbarui',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui zona'
    });
  }
};

// Delete zone
const deleteZone = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT * FROM zones WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Zona tidak ditemukan'
      });
    }

    await db.query('DELETE FROM zones WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Zona berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus zona'
    });
  }
};

module.exports = {
  getZones,
  createZone,
  updateZone,
  deleteZone
};
