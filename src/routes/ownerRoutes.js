const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/ownerController');
const { verifyOwner } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyOwner, OwnerController.getDashboard);
router.get('/admins', verifyOwner, OwnerController.getAdmins);
router.post('/admins', verifyOwner, OwnerController.createAdmin);
router.patch('/admins/:id/status', verifyOwner, OwnerController.toggleAdminStatus);
router.get('/logs', verifyOwner, OwnerController.getLogs);

module.exports = router;
