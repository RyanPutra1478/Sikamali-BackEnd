const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const logController = require('./logController');

const register = async (req, res) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      ...result,
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username dan password wajib diisi' });
  }

  try {
    const result = await AuthService.login(username, password, req.ip);
    res.json({
      success: true,
      ...result,
      message: 'Login berhasil'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token diperlukan' });
  }

  try {
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'TokenExpiredError') {
      await AuthService.logout(refreshToken);
      return res.status(401).json({ success: false, error: 'Sesi telah berakhir. Silakan login kembali.' });
    }
    res.status(403).json({ success: false, error: error.message });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token diperlukan' });

  try {
    await AuthService.logout(refreshToken);
    res.json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Gagal logout' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan' });

    const userClean = { ...user };
    delete userClean.password;

    res.json({ success: true, data: userClean });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: 'Gagal mengambil data pengguna' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Password saat ini dan password baru harus diisi' });
  }

  try {
    const user = await UserService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan' });

    const isMatch = await UserService.validatePassword(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Password saat ini salah' });

    await UserService.updatePassword(user.id, newPassword);
    await AuthService.logoutAll(user.id); // Option to logout all sessions

    res.json({ success: true, message: 'Password berhasil diubah. Silakan login kembali.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Gagal mengubah password' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};