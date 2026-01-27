const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints } = require('../controllers/complaintController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createComplaint);
router.get('/', authMiddleware, getComplaints);

module.exports = router;
