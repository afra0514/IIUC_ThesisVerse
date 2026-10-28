const Bookmark = require('../models/Bookmark');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.customId || req.user._id.toString();
    const doc = await Bookmark.findOne({ userId });
    res.json({ ok: true, items: doc ? doc.items : [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Save user bookmarks
// @route   POST /api/bookmarks
// @access  Private
exports.saveBookmarks = async (req, res) => {
  try {
    const userId = req.user.customId || req.user._id.toString();
    const { items = [] } = req.body;

    const doc = await Bookmark.findOneAndUpdate(
      { userId },
      { items, userId },
      { upsert: true, new: true }
    );

    res.json({ ok: true, items: doc.items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
