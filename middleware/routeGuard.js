const { ROLES } = require('./auth');
const { hasRouteAccess } = require('../config/routes');

/**
 * Middleware to protect routes based on user roles and permissions
 */
const routeGuard = (req, res, next) => {
  try {
    const userRole = req.user?.role || ROLES.GUEST;
    const path = req.path;
    const method = req.method;

    // Check if the user has access to this route
    if (hasRouteAccess(userRole, path, method)) {
      return next();
    }

    // If user is not authenticated, return 401
    if (userRole === ROLES.GUEST) {
      return res.status(401).json({
        error: 'Anda harus login untuk mengakses fitur ini.'
      });
    }

    // If user is authenticated but not authorized, return 403
    res.status(403).json({
      error: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.'
    });
  } catch (error) {
    console.error('Error in routeGuard middleware:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

/**
 * Middleware to check if user has any of the specified roles
 */
const hasAnyRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || ROLES.GUEST;
    
    if (roles.includes(userRole) || userRole === ROLES.SUPER_ADMIN) {
      return next();
    }
    
    res.status(403).json({
      error: `Akses ditolak. Diperlukan salah satu role: ${roles.join(', ')}`
    });
  };
};

/**
 * Middleware to check if user has all the specified permissions
 */
const hasAllPermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user?.role || ROLES.GUEST;
    
    // Super admin has all permissions
    if (userRole === ROLES.SUPER_ADMIN) {
      return next();
    }

    // Check if user has all required permissions
    const hasAll = requiredPermissions.every(permission => {
      const [resource, action, scope] = permission.split(':');
      
      // Check admin permissions
      if (userRole === ROLES.ADMIN) {
        const adminPermissions = [
          'data:read', 'data:create', 'data:update', 'data:delete',
          'location:read', 'location:create', 'location:update', 'location:delete',
          'announcement:read', 'announcement:create', 'announcement:update', 'announcement:delete'
        ];
        
        return adminPermissions.includes(permission) || 
               adminPermissions.includes(`${resource}:*`);
      }
      
      // Check user permissions
      if (userRole === ROLES.USER) {
        const userPermissions = [
          'data:create', 'data:read:own', 'data:update:own', 'data:delete:own'
        ];
        
        return userPermissions.includes(permission);
      }
      
      // Check guest permissions
      if (userRole === ROLES.GUEST) {
        return permission === 'data:read';
      }
      
      return false;
    });
    
    if (hasAll) {
      return next();
    }
    
    res.status(403).json({
      error: 'Akses ditolak. Anda tidak memiliki izin yang cukup.'
    });
  };
};

module.exports = {
  routeGuard,
  hasAnyRole,
  hasAllPermissions
};
