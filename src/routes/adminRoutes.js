const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, AdminController.getDashboard);
router.get('/configs', verifyToken, AdminController.getConfigs);
router.post('/configs', verifyToken, AdminController.createConfig);

module.exports = router;
