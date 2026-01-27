const db = require('../config/database');

// Update profil user (data disimpan di tabel users)
async function updateProfile(req, res) {
  const { nama, tempat_lahir, tanggal_lahir, alamat, pendidikan, pekerjaan, telepon } = req.body;

  try {
    const validTanggalLahir = (tanggal_lahir === '' || tanggal_lahir === 'undefined') ? null : tanggal_lahir;

    await db.query(
      `UPDATE users SET 
        nama=?, 
        tempat_lahir=?, 
        tanggal_lahir=?, 
        alamat=?, 
        pendidikan=?, 
        pekerjaan=?, 
        telepon=? 
       WHERE id=?`,
      [
        nama,
        tempat_lahir,
        validTanggalLahir,
        alamat,
        pendidikan,
        pekerjaan,
        telepon,
        req.user.id
      ]
    );

    // Return updated profile with join to roles
    const [rows] = await db.query(`
      SELECT u.id, u.email, u.nama, u.tempat_lahir, u.tanggal_lahir, u.alamat, u.pendidikan, u.pekerjaan, u.telepon, r.name as role 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `, [req.user.id]);

    res.json({ message: 'Profil diperbarui', user: rows[0] });
  } catch (err) {
    console.error("Error update profile:", err);
    res.status(500).json({ error: err.message });
  }
}

// Get profile (dari tabel users)
async function getProfile(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.email, u.nama, u.tempat_lahir, u.tanggal_lahir, u.alamat, u.pendidikan, u.pekerjaan, u.telepon, r.name as role 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ?
    `, [req.user.id]);
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { updateProfile, getProfile };
