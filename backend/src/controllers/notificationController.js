const Notification = require('../models/Notification');

const getRecipientKey = (user) => {
  if (!user) return null;
  if (user.role === 'supervisor') return `s:${user.supervisorId}`;
  return `u:${user.customId || user._id.toString()}`;
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const key = getRecipientKey(req.user);
    if (!key) return res.json({ ok: true, notifications: [] });

    const notifications = await Notification.find({ recipient: key }).sort({ createdAt: -1 });
    res.json({ ok: true, notifications: notifications.map((n) => n.toJSON()) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!notification) {
      return res.status(404).json({ ok: false, error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ ok: true, notification: notification.toJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    const key = getRecipientKey(req.user);
    if (!key) return res.json({ ok: true });

    await Notification.updateMany({ recipient: key }, { read: true });
    res.json({ ok: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
