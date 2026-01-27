const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_sikamali_2025';

// Role hierarchy and permissions
const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// Role-based access control (RBAC) configuration
const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // Full access
  [ROLES.ADMIN]: [
    'data:read', 'data:create', 'data:update', 'data:delete',
    'location:read', 'location:create', 'location:update', 'location:delete'
  ],
  [ROLES.USER]: [
    'data:create', 'data:read:own' // Create only (and read own to verify?)
  ],
  [ROLES.GUEST]: [
    'data:read' // Read only Data Preview
  ]
};

// 1. Middleware Verifikasi Token (Wajib Login)
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = { role: ROLES.GUEST };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Token tidak valid atau kadaluwarsa.' });
    }
    req.user = user;
    next();
  });
}

// 2. Middleware Cek Permission
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role || ROLES.GUEST;
    const userPermissions = PERMISSIONS[userRole] || [];

    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    const hasPermission = userPermissions.some(permission => {
      if (permission === '*') return true;

      const [resource, action, scope] = requiredPermission.split(':');
      const [userResource, userAction, userScope] = permission.split(':');

      if (userResource !== resource || userAction !== action) {
        return false;
      }
      return !scope || !userScope || userScope === scope || userScope === '*';
    });

    if (!hasPermission) {
      return res.status(403).json({
        error: `Akses ditolak. Anda tidak memiliki izin untuk ${requiredPermission}.`
      });
    }

    next();
  };
};

// 3. Middleware Cek Role (for backward compatibility)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || ROLES.GUEST;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: `Akses ditolak. Role Anda (${userRole}) tidak diizinkan.`
      });
    }
    next();
  };
};

// 4. Middleware Super Admin Only
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      error: 'Akses ditolak. Hanya Super Admin yang dapat mengakses.'
    });
  }
  next();
};

// 5. Middleware Admin & Super Admin
const adminOnly = (req, res, next) => {
  const userRole = req.user?.role;
  if (userRole !== ROLES.ADMIN && userRole !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      error: 'Akses ditolak. Hanya Admin dan Super Admin yang dapat mengakses.'
    });
  }
  next();
};

// 6. Middleware Authenticated Users Only
const authenticatedOnly = (req, res, next) => {
  if (!req.user || req.user.role === ROLES.GUEST) {
    return res.status(401).json({
      error: 'Anda harus login untuk mengakses fitur ini.'
    });
  }
  next();
};

module.exports = {
  ROLES,
  authMiddleware,
  checkPermission,
  authorizeRoles,
  superAdminOnly,
  adminOnly,
  authenticatedOnly
};
