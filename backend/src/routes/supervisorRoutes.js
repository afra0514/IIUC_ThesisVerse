const express = require('express');
const router = express.Router();
const {
  getSupervisors,
  getSupervisorById,
  updateSupervisor
} = require('../controllers/supervisorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSupervisors);
router.get('/:id', getSupervisorById);
router.put('/:id', protect, updateSupervisor);

module.exports = router;
