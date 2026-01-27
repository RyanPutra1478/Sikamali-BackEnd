const StatService = require('../services/statService');
const EmploymentService = require('../services/employmentService');
const SocialService = require('../services/socialService');
const UserService = require('../services/userService');
const KKModel = require('../models/kkModel');
const db = require('../config/database');

async function getDashboardStats(req, res) {
  try {
    const stats = await StatService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getKKTable(req, res) {
  try {
    const { role, id } = req.user;
    // Allow superadmin, admin, and user (staff) to see all data
    const userIdFilter = (role === 'superadmin' || role === 'admin' || role === 'user') ? null : id;
    const rows = await KKModel.getAllEnriched(userIdFilter);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getKesejahteraanData(req, res) {
  try {
    const data = await SocialService.getKesejahteraanData(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createKesejahteraan(req, res) {
  try {
    const result = await SocialService.upsertKesejahteraan(req.user, req.body, req.ip);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateKesejahteraanRecord(req, res) {
  try {
    await SocialService.updateKesejahteraanRecord(req.user, req.params.id, req.body, req.ip);
    res.json({ message: 'Data kesejahteraan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteKesejahteraanRecord(req, res) {
  try {
    await SocialService.deleteKesejahteraan(req.user.id, req.params.id, req.ip);
    res.json({ message: 'Data dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEmploymentData(req, res) {
  try {
    const data = await EmploymentService.getEmploymentData(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateEmploymentFull(req, res) {
  try {
    await EmploymentService.upsertEmploymentFull(req.user, req.body, req.ip);
    res.json({ message: 'Data berhasil diperbarui.' });
  } catch (err) {
    res.status(err.message.includes('akses') ? 403 : 500).json({ error: err.message });
  }
}

async function deleteEmploymentData(req, res) {
  try {
    await EmploymentService.deleteEmployment(req.user.id, req.params.id, req.ip);
    res.json({ message: 'Data dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getLandData(req, res) {
  try {
    const { LandPlotModel } = require('../models/otherModels');
    const data = await LandPlotModel.getAllEnriched();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateLandData(req, res) {
  try {
    const { LandPlotModel } = require('../models/otherModels');
    await LandPlotModel.update(req.params.id, req.body);
    res.json({ message: 'Data berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  try {
    const { username, password, role, email } = req.body;
    const userId = await UserService.registerUser({
      username,
      email,
      password,
      roleName: role,
      must_change_password: 1
    });
    res.status(201).json({ message: 'User dibuat', id: userId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    if (parseInt(req.params.id) === req.user.id) throw new Error('Tidak bisa hapus akun sendiri');
    await UserService.deleteUser(req.params.id);
    res.json({ message: 'User dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const RoleModel = require('../models/roleModel');
    const roleObj = await RoleModel.getByName(role);
    if (!roleObj) throw new Error('Role tidak valid');

    await UserService.updateUser(req.params.id, { role_id: roleObj.id });
    res.json({ message: 'Role diperbarui' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateUserPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) throw new Error('Password minimal 6 karakter');

    await UserService.updatePassword(req.params.id, password);
    res.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getUsersWithKK(req, res) {
  try {
    const [rows] = await db.query('SELECT id as kk_id, nomor_kk, kepala_keluarga, alamat FROM kk ORDER BY kepala_keluarga ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDashboardStats, getKKTable, getEmploymentData, getKesejahteraanData,
  createKesejahteraan, getUsersWithKK, listUsers, createUser, deleteUser,
  updateUserRole, getLandData, updateLandData, deleteEmploymentData,
  deleteKesejahteraanRecord,
  updateEmploymentFull, updateKesejahteraanRecord,
  updateUserPassword
};
