const { ROLES } = require('./auth');

// Route protection based on roles
const roleMiddleware = {
  // Check if user is Super Admin
  isSuperAdmin: (req, res, next) => {
    if (req.user?.role === ROLES.SUPER_ADMIN) {
      return next();
    }
    res.status(403).json({ error: 'Akses ditolak. Hanya Super Admin yang diizinkan.' });
  },

  // Check if user is Admin or Super Admin
  isAdmin: (req, res, next) => {
    const { role } = req.user || {};
    if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
      return next();
    }
    res.status(403).json({ error: 'Akses ditolak. Hanya Admin dan Super Admin yang diizinkan.' });
  },

  // Check if user is a regular user or above
  isUser: (req, res, next) => {
    const { role } = req.user || {};
    if ([ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)) {
      return next();
    }
    res.status(403).json({ error: 'Akses ditolak. Anda harus login sebagai pengguna terdaftar.' });
  },

  // Check if user is guest (not logged in)
  isGuest: (req, res, next) => {
    if (!req.user || req.user.role === ROLES.GUEST) {
      return next();
    }
    res.status(403).json({ error: 'Akses hanya untuk tamu (belum login).' });
  },

  // Check if user has specific role
  hasRole: (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          error: `Akses ditolak. Role yang diizinkan: ${roles.join(', ')}`
        });
      }
      next();
    };
  },

  // Check if user can access their own data
  isOwnerOrAdmin: (model, idParam = 'id') => {
    return async (req, res, next) => {
      try {
        const { role, id: userId } = req.user || {};
        
        // Allow admins and super admins
        if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
          return next();
        }

        // For regular users, check ownership
        const itemId = req.params[idParam];
        const item = await model.findByPk(itemId);

        if (!item) {
          return res.status(404).json({ error: 'Data tidak ditemukan' });
        }

        // Check if the item belongs to the user
        if (item.userId !== userId) {
          return res.status(403).json({
            error: 'Akses ditolak. Anda hanya dapat mengakses data milik Anda sendiri.'
          });
        }

        next();
      } catch (error) {
        console.error('Error in isOwnerOrAdmin middleware:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
      }
    };
  },

  // Check permissions for specific actions
  hasPermission: (resource, action, scope) => {
    return (req, res, next) => {
      const { role } = req.user || { role: ROLES.GUEST };
      const permission = scope ? `${resource}:${action}:${scope}` : `${resource}:${action}`;
      
      // Super admin has all permissions
      if (role === ROLES.SUPER_ADMIN) {
        return next();
      }

      // Check admin permissions
      if (role === ROLES.ADMIN) {
        const adminPermissions = [
          'data:read', 'data:create', 'data:update', 'data:delete',
          'location:read', 'location:create', 'location:update', 'location:delete',
          'announcement:read', 'announcement:create', 'announcement:update', 'announcement:delete'
        ];
        
        if (adminPermissions.includes(permission) || adminPermissions.includes(`${resource}:*`)) {
          return next();
        }
      }

      // Check user permissions
      if (role === ROLES.USER) {
        const userPermissions = [
          'data:create', 'data:read:own', 'data:update:own', 'data:delete:own'
        ];
        
        if (userPermissions.includes(permission)) {
          // For own data, check ownership
          if (action.includes('own') && req.params.id) {
            return roleMiddleware.isOwnerOrAdmin()(req, res, next);
          }
          return next();
        }
      }

      // Check guest permissions
      if (role === ROLES.GUEST && permission === 'data:read') {
        return next();
      }

      res.status(403).json({
        error: `Akses ditolak. Anda tidak memiliki izin untuk ${permission}`
      });
    };
  }
};

module.exports = roleMiddleware;
