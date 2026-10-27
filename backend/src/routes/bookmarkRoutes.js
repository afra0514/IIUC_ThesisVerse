const express = require('express');
const router = express.Router();
const { getBookmarks, saveBookmarks } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBookmarks);
router.post('/', protect, saveBookmarks);

module.exports = router;
