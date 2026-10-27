const SupervisorProfile = require('../models/SupervisorProfile');
const User = require('../models/User');
const SupervisionRequest = require('../models/SupervisionRequest');

// @desc    Get all supervisors with live accepted counts & open slot calculations
// @route   GET /api/supervisors
// @access  Public
exports.getSupervisors = async (req, res) => {
  try {
    const [profiles, supervisorUsers, acceptedRequests] = await Promise.all([
      SupervisorProfile.find({}).sort({ profileId: 1 }),
      User.find({ role: 'supervisor' }),
      SupervisionRequest.find({ status: 'accepted' })
    ]);

    const claimed = new Set(supervisorUsers.map((u) => String(u.supervisorId)).filter(Boolean));

    const list = profiles.map((p) => {
      const pIdStr = String(p.profileId);
      const acceptedCount = acceptedRequests.filter((r) => String(r.supervisorId) === pIdStr).length;
      const openSlots = Number(p.openSlots) || 0;

      return {
        ...p.toJSON(),
        hasAccount: claimed.has(pIdStr),
        acceptedCount,
        openSlotsLeft: Math.max(0, openSlots - acceptedCount)
      };
    });

    res.json({ ok: true, supervisors: list });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Get single supervisor
// @route   GET /api/supervisors/:id
// @access  Public
exports.getSupervisorById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await SupervisorProfile.findOne({ profileId: id });
    if (!profile) {
      return res.status(404).json({ ok: false, error: 'Supervisor not found' });
    }

    const acceptedRequests = await SupervisionRequest.countDocuments({
      supervisorId: id,
      status: 'accepted'
    });

    const openSlots = Number(profile.openSlots) || 0;

    res.json({
      ok: true,
      supervisor: {
        ...profile.toJSON(),
        acceptedCount: acceptedRequests,
        openSlotsLeft: Math.max(0, openSlots - acceptedRequests)
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Update supervisor profile details
// @route   PUT /api/supervisors/:id
// @access  Private (Supervisor or Admin)
exports.updateSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await SupervisorProfile.findOne({ profileId: id });
    if (!profile) {
      return res.status(404).json({ ok: false, error: 'Supervisor profile not found' });
    }

    const data = req.body;
    if (data.papers !== undefined) profile.papers = Math.max(0, Number(data.papers) || 0);
    if (data.openSlots !== undefined) profile.openSlots = Math.max(0, Number(data.openSlots) || 0);
    if (data.tags !== undefined) {
      profile.tags = Array.isArray(data.tags)
        ? data.tags
        : String(data.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (data.bio !== undefined) profile.bio = data.bio.trim();
    if (data.scholar !== undefined) profile.scholar = data.scholar.trim();
    if (data.researchgate !== undefined) profile.researchgate = data.researchgate.trim();
    if (data.linkedin !== undefined) profile.linkedin = data.linkedin.trim();
    if (data.phone !== undefined) profile.phone = data.phone.trim();
    if (data.name !== undefined) profile.name = data.name.trim();

    await profile.save();
    res.json({ ok: true, supervisor: profile.toJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
