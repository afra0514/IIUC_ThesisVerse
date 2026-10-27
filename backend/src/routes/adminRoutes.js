const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminSession,
  updateAdminAccount,
  getStats,
  listUsers,
  listUnclaimedProfiles,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', adminLogin);
router.get('/session', protect, adminOnly, getAdminSession);
router.put('/account', protect, adminOnly, updateAdminAccount);
router.get('/stats', getStats);
router.get('/users', protect, adminOnly, listUsers);
router.get('/unclaimed-profiles', protect, adminOnly, listUnclaimedProfiles);
router.post('/users', protect, adminOnly, createUser);
router.put('/users/:id', protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
