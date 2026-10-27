const SupervisionRequest = require('../models/SupervisionRequest');
const SupervisorProfile = require('../models/SupervisorProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// @desc    Get supervision requests (filtered by user role)
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'student') {
      const uId = user.customId || user._id.toString();
      query = { studentUserId: uId };
    } else if (user.role === 'supervisor') {
      query = { supervisorId: String(user.supervisorId) };
    } // admin sees all

    const requests = await SupervisionRequest.find(query).sort({ createdAt: -1 });
    res.json({ ok: true, requests: requests.map((r) => r.toJSON()) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Student sends a new supervision request
// @route   POST /api/requests
// @access  Private (Student)
exports.createRequest = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'student') {
      return res.status(403).json({ ok: false, error: 'Only students can send supervision requests.' });
    }

    const { supervisorId, student, topic, description, members, message } = req.body;
    const supIdStr = String(supervisorId);

    const sup = await SupervisorProfile.findOne({ profileId: supIdStr });
    if (!sup) {
      return res.status(404).json({ ok: false, error: 'Supervisor not found.' });
    }

    const studentUserIdStr = user.customId || user._id.toString();

    // Check existing request
    const existing = await SupervisionRequest.findOne({
      studentUserId: studentUserIdStr,
      supervisorId: supIdStr,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existing) {
      return res.status(400).json({
        ok: false,
        error:
          existing.status === 'pending'
            ? 'You already have a pending request with this supervisor.'
            : 'This supervisor has already accepted your request.'
      });
    }

    // Check slots
    const acceptedCount = await SupervisionRequest.countDocuments({
      supervisorId: supIdStr,
      status: 'accepted'
    });

    const openSlots = Number(sup.openSlots) || 0;
    if (openSlots - acceptedCount <= 0) {
      return res.status(400).json({ ok: false, error: 'This supervisor has no open supervision slots left.' });
    }

    const cleanTopic = (topic || '').trim();
    if (!cleanTopic) {
      return res.status(400).json({ ok: false, error: 'Thesis topic is required.' });
    }

    const newRequest = new SupervisionRequest({
      requestId: makeId('req'),
      studentUserId: studentUserIdStr,
      supervisorId: supIdStr,
      status: 'pending',
      student: student || {
        name: user.name,
        studentId: user.studentId || '',
        email: user.email,
        department: user.department,
        batch: user.batch || '',
        phone: user.phone || ''
      },
      topic: cleanTopic,
      description: (description || '').trim(),
      members: Array.isArray(members) ? members : [],
      message: (message || '').trim()
    });

    await newRequest.save();

    // Send notification to supervisor
    const notification = new Notification({
      notificationId: makeId('ntf'),
      recipient: `s:${supIdStr}`,
      type: 'request_received',
      title: 'New supervision request',
      message: `${newRequest.student.name} (${newRequest.student.studentId}) sent a request for “${cleanTopic}”.`,
      requestId: newRequest.requestId
    });
    await notification.save();

    res.status(201).json({ ok: true, request: newRequest.toJSON() });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Supervisor responds to a supervision request
// @route   PATCH /api/requests/:id/status
// @access  Private (Supervisor)
exports.respondToRequest = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'supervisor') {
      return res.status(403).json({ ok: false, error: 'Only supervisors can respond to requests.' });
    }

    const { id } = req.params;
    const { status, note = '' } = req.body;

    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ ok: false, error: 'Invalid status. Must be accepted or rejected.' });
    }

    const request = await SupervisionRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ ok: false, error: 'Request not found.' });
    }

    if (String(request.supervisorId) !== String(user.supervisorId)) {
      return res.status(403).json({ ok: false, error: 'This request was not sent to you.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ ok: false, error: 'This request has already been answered.' });
    }

    if (status === 'accepted') {
      const sup = await SupervisorProfile.findOne({ profileId: String(user.supervisorId) });
      const acceptedCount = await SupervisionRequest.countDocuments({
        supervisorId: String(user.supervisorId),
        status: 'accepted'
      });
      const openSlots = sup ? Number(sup.openSlots) || 0 : 0;
      if (openSlots - acceptedCount <= 0) {
        return res.status(400).json({
          ok: false,
          error: 'You have no open slots left. Increase your open slots in Profile Settings first.'
        });
      }
    }

    const cleanNote = note.trim();
    request.status = status;
    request.responseNote = cleanNote;
    request.respondedAt = new Date();
    await request.save();

    // Create notification for student
    const supName = user.name;
    const notification = new Notification({
      notificationId: makeId('ntf'),
      recipient: `u:${request.studentUserId}`,
      type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
      title: status === 'accepted' ? 'Request accepted' : 'Request rejected',
      message:
        status === 'accepted'
          ? `${supName} accepted your supervision request for “${request.topic}”.`
          : `${supName} rejected your supervision request for “${request.topic}”.${
              cleanNote ? ` Reason: ${cleanNote}` : ''
            }`,
      requestId: request.requestId
    });
    await notification.save();

    res.json({ ok: true, request: request.toJSON() });
  } catch (err) {
    console.error('Respond request error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
