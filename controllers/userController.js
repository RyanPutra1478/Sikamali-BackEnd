const UserService = require('../services/userService');
const AuthService = require('../services/authService');
const logController = require('./logController');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(username, password, req.ip);
    res.json(result);
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userId = await UserService.registerUser(req.body);
    const user = await UserService.getUserById(userId);

    await logController.createLog(req.user.id, 'CREATE', 'USER', userId, { username: user.username, role: user.role }, req.ip);

    res.status(201).json({ success: true, message: 'Pengguna berhasil dibuat', data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const oldUser = await UserService.getUserById(req.params.id);
    await UserService.updateUser(req.params.id, req.body);
    const user = await UserService.getUserById(req.params.id);

    await logController.createLog(req.user.id, 'UPDATE', 'USER', req.params.id, { old: oldUser, new: req.body }, req.ip);

    res.json({ success: true, message: 'Data pengguna berhasil diperbarui', data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await UserService.updateUser(req.user.id, req.body);
    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    await UserService.deleteUser(req.params.id);

    await logController.createLog(req.user.id, 'DELETE', 'USER', req.params.id, { username: user.username }, req.ip);

    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

