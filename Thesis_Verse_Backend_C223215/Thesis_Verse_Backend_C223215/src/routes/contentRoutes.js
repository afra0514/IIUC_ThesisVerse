const express = require('express');
const router = express.Router();
const {
  getContent,
  saveItem,
  deleteItem,
  moveItem,
  resetDefaults
} = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/:kind', getContent);
router.post('/:kind', protect, adminOnly, saveItem);
router.post('/:kind/move', protect, adminOnly, moveItem);
router.post('/:kind/reset', protect, adminOnly, resetDefaults);
router.delete('/:kind/:id', protect, adminOnly, deleteItem);

module.exports = router;
