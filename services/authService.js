const jwt = require('jsonwebtoken');
const db = require('../config/database');
const UserService = require('./userService');
const RoleModel = require('../models/roleModel');
const logController = require('../controllers/logController');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    console.error('FATAL: JWT secrets are not defined in environment variables!');
    process.exit(1);
}

const AuthService = {
    generateToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                role: user.role_name || user.role,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '60m' }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
        );
    },

    login: async (username, password, ip) => {
        const user = await UserService.getUserByUsername(username);
        if (!user) {
            await logController.createLog(null, 'LOGIN_FAILED', 'AUTH', null, { username, reason: 'User not found' }, ip);
            throw new Error('Username atau password salah');
        }

        if (user.status !== 'active') {
            await logController.createLog(user.id, 'LOGIN_FAILED', 'AUTH', user.id, { username, reason: 'Account inactive' }, ip);
            throw new Error('Akun Anda dinonaktifkan. Silakan hubungi administrator.');
        }

        const isMatch = await UserService.validatePassword(password, user.password);
        if (!isMatch) {
            await logController.createLog(user.id, 'LOGIN_FAILED', 'AUTH', user.id, { username, reason: 'Wrong password' }, ip);
            throw new Error('Username atau password salah');
        }

        const token = AuthService.generateToken(user);
        const refreshToken = AuthService.generateRefreshToken(user);

        // Store refresh token
        await db.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${process.env.JWT_REFRESH_SQL_INTERVAL || '7 DAY'}))`,
            [user.id, refreshToken]
        );

        await logController.createLog(user.id, 'LOGIN', 'AUTH', user.id, { username }, ip);

        const userResponse = { ...user };
        delete userResponse.password;

        return { token, refreshToken, user: userResponse };
    },

    register: async (userData) => {
        const { username, email, roleName = 'user' } = userData;

        // Check existing
        const existing = await UserService.getUserByUsername(username);
        if (existing) throw new Error('Username sudah terdaftar');

        const role = await RoleModel.getByName(roleName);
        if (!role) throw new Error('Role tidak valid');

        const userId = await UserService.registerUser({
            ...userData,
            role_id: role.id
        });

        const newUser = await UserService.getUserById(userId);
        const token = AuthService.generateToken(newUser);
        const refreshToken = AuthService.generateRefreshToken(newUser);

        await db.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ${process.env.JWT_REFRESH_SQL_INTERVAL || '7 DAY'}))`,
            [userId, refreshToken]
        );

        const userResponse = { ...newUser };
        delete userResponse.password;

        return { token, refreshToken, user: userResponse };
    },

    refreshAccessToken: async (refreshToken) => {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const [tokens] = await db.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
            [refreshToken]
        );

        if (tokens.length === 0) {
            console.warn('[AUTH-SERVICE] Refresh Token Validation Failed: Token not found or expired in DB');
            throw new Error('Refresh token tidak valid atau kadaluwarsa');
        }

        const user = await UserService.getUserById(decoded.id);
        if (!user) throw new Error('Pengguna tidak ditemukan');

        const newToken = AuthService.generateToken(user);

        const userClean = { ...user };
        delete userClean.password;

        return { token: newToken, user: userClean };
    },

    logout: async (refreshToken) => {
        await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        return true;
    }
};

module.exports = AuthService;
