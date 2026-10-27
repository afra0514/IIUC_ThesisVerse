const express = require('express');
const router = express.Router();
const {
  getRequests,
  createRequest,
  respondToRequest
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.patch('/:id/status', protect, respondToRequest);

module.exports = router;
