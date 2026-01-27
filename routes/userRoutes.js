const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { ROLES } = require('../middleware/auth');
const { routeGuard, hasAnyRole } = require('../middleware/routeGuard');
const validate = require('../middleware/validate');

// Public routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nama lengkap harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password minimal 6 karakter'),
  ],
  validate,
  userController.createUser
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('password').notEmpty().withMessage('Password harus diisi'),
  ],
  validate,
  userController.login
);

// Protected routes (require authentication)
router.use(authMiddleware);

// User profile routes
router.get('/me', userController.getProfile);
router.put(
  '/me',
  [
    body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').optional().isEmail().withMessage('Email tidak valid'),
    body('username').optional().notEmpty().withMessage('Username tidak boleh kosong'),
    body('currentPassword')
      .if(body('newPassword').exists())
      .notEmpty()
      .withMessage('Password saat ini harus diisi'),
    body('newPassword')
      .if(body('currentPassword').exists())
      .isLength({ min: 6 })
      .withMessage('Password baru minimal 6 karakter'),
  ],
  validate,
  userController.updateProfile
);

// Admin routes (require admin or super admin role)
router.use(hasAnyRole(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Super Admin only routes
router.use(hasAnyRole(ROLES.SUPER_ADMIN));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Nama lengkap harus diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('username').notEmpty().withMessage('Username harus diisi'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password minimal 6 karakter'),
    body('role')
      .isIn(Object.values(ROLES))
      .withMessage('Role tidak valid'),
  ],
  validate,
  userController.createUser
);

router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').optional().isEmail().withMessage('Email tidak valid'),
    body('username').optional().notEmpty().withMessage('Username tidak boleh kosong'),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage('Role tidak valid'),
  ],
  validate,
  userController.updateUser
);

router.delete('/:id', userController.deleteUser);

module.exports = router;
