const { ROLES } = require('../middleware/auth');

// Route configuration for role-based access control
const ROUTE_CONFIG = {
  // Authentication routes
  '/api/auth/register': {
    POST: [ROLES.GUEST]
  },
  '/api/auth/login': {
    POST: [ROLES.GUEST]
  },
  '/api/auth/me': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },

  // User management routes (Super Admin only)
  '/api/users': {
    GET: [ROLES.SUPER_ADMIN],
    POST: [ROLES.SUPER_ADMIN]
  },
  '/api/users/:id': {
    GET: [ROLES.SUPER_ADMIN],
    PUT: [ROLES.SUPER_ADMIN],
    DELETE: [ROLES.SUPER_ADMIN]
  },

  // Data routes
  '/api/data': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    POST: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/data/own': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/data/:id': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    PUT: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    DELETE: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/data/user/:userId': {
    GET: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },

  // Location & Domisili routes
  '/api/locations': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    POST: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/locations/:id': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    PUT: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    DELETE: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/locations/zona': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    POST: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/locations/zona/:id': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    PUT: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    DELETE: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },

  // Announcement routes
  '/api/announcements': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    POST: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/announcements/:id': {
    GET: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.GUEST],
    PUT: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    DELETE: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },

  // Admin dashboard routes
  '/api/admin/dashboard': {
    GET: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/admin/users': {
    GET: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  },
  '/api/admin/statistics': {
    GET: [ROLES.ADMIN, ROLES.SUPER_ADMIN]
  }
};

// Helper function to check if a user has access to a route
const hasRouteAccess = (userRole, path, method) => {
  // Allow all OPTIONS requests for CORS
  if (method === 'OPTIONS') return true;

  // Find the route configuration that matches the path
  const routeConfig = Object.entries(ROUTE_CONFIG).find(([route]) => {
    // Convert route to regex to handle parameters
    const routeRegex = new RegExp(`^${route.replace(/:[^/]+/g, '([^/]+)')}$`);
    return routeRegex.test(path);
  });

  if (!routeConfig) {
    // Route not found in config, default to requiring authentication
    return userRole !== ROLES.GUEST;
  }

  const [route, methods] = routeConfig;
  const methodConfig = methods[method] || methods.ALL;

  if (!methodConfig) {
    // Method not allowed for this route
    return false;
  }

  // Check if user's role is in the allowed roles for this route and method
  return methodConfig.includes(userRole) || methodConfig.includes(ROLES.SUPER_ADMIN);
};

module.exports = {
  ROUTE_CONFIG,
  hasRouteAccess
};
