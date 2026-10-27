const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SupervisorProfile = require('../models/SupervisorProfile');
const SupervisionRequest = require('../models/SupervisionRequest');
const Notification = require('../models/Notification');
const Guideline = require('../models/Guideline');
const Template = require('../models/Template');
const Journal = require('../models/Journal');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'iiuc_thesisverse_secret_key_2026', {
    expiresIn: '7d'
  });
};

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const deptLabel = (dept) => (dept === 'EEE' ? 'Dept. of EEE' : 'Dept. of CSE');

const cleanTags = (tags) =>
  Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : String(tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

const profileFields = (d) => ({
  papers: Math.max(0, Number(d.papers) || 0),
  openSlots: Math.max(0, Number(d.openSlots) || 0),
  tags: cleanTags(d.tags),
  bio: (d.bio || '').trim(),
  scholar: (d.scholar || '').trim(),
  researchgate: (d.researchgate || '').trim(),
  linkedin: (d.linkedin || '').trim()
});

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ ok: false, error: 'Invalid admin email or password.' });
    }

    const admin = await User.findOne({ email: cleanEmail, role: 'admin' });
    if (!admin) {
      return res.status(401).json({ ok: false, error: 'Invalid admin email or password.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid admin email or password.' });
    }

    const token = generateToken(admin._id);

    res.json({
      ok: true,
      token,
      admin: {
        id: admin.customId || admin._id.toString(),
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ ok: false, error: 'Server error during admin login' });
  }
};

// @desc    Get admin session
// @route   GET /api/admin/session
// @access  Private (Admin)
exports.getAdminSession = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ ok: false, error: 'Admin session invalid' });
    }
    res.json({
      ok: true,
      admin: {
        id: admin.customId || admin._id.toString(),
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Update admin account credentials
// @route   PUT /api/admin/account
// @access  Private (Admin)
exports.updateAdminAccount = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ ok: false, error: 'Admin account not found.' });
    }

    const cleanName = (name ?? admin.name).trim();
    const cleanEmail = (email ?? admin.email).trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }

    if (cleanEmail !== admin.email) {
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: admin._id } });
      if (existing) {
        return res.status(400).json({ ok: false, error: 'Another admin or user already uses this email.' });
      }
      admin.email = cleanEmail;
    }

    admin.name = cleanName;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ ok: false, error: 'Current password is required.' });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ ok: false, error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters.' });
      }
      admin.password = newPassword;
    }

    await admin.save();

    res.json({
      ok: true,
      admin: {
        id: admin.customId || admin._id.toString(),
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Get dashboard metrics & statistics
// @route   GET /api/admin/stats
// @access  Public / Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const [students, supervisors, requests, guidelines, templates, journals] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      SupervisionRequest.find({}),
      Guideline.countDocuments(),
      Template.countDocuments(),
      Journal.countDocuments()
    ]);

    const stats = {
      students,
      supervisors,
      requests: {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        accepted: requests.filter((r) => r.status === 'accepted').length,
        rejected: requests.filter((r) => r.status === 'rejected').length
      },
      guidelines,
      templates,
      journals
    };

    res.json({ ok: true, stats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    List all registered users (students & supervisors)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    const profiles = await SupervisorProfile.find({});
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.profileId] = p.toJSON();
    });

    const userList = users.map((u) => {
      const safe = u.toJSON();
      if (u.role === 'supervisor') {
        safe.profile = profileMap[u.supervisorId] || {};
      }
      return safe;
    });

    res.json({ ok: true, users: userList });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    List directory profiles that have no account yet
// @route   GET /api/admin/unclaimed-profiles
// @access  Private (Admin)
exports.listUnclaimedProfiles = async (req, res) => {
  try {
    const supervisorUsers = await User.find({ role: 'supervisor' });
    const claimedIds = new Set(supervisorUsers.map((u) => String(u.supervisorId)).filter(Boolean));
    const allProfiles = await SupervisorProfile.find({});

    const unclaimed = allProfiles
      .filter((p) => !claimedIds.has(String(p.profileId)))
      .map((p) => p.toJSON());

    res.json({ ok: true, unclaimed });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Create student or supervisor user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const data = req.body;
    const role = data.role === 'supervisor' ? 'supervisor' : 'student';
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password || '';
    const department = data.department === 'EEE' ? 'EEE' : 'CSE';

    if (!name || !email) return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    if (password.length < 6) return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ ok: false, error: 'A user with this email already exists.' });
    }

    let newUserPayload = {
      role,
      name,
      email,
      password,
      department,
      phone: (data.phone || '').trim()
    };

    if (role === 'student') {
      const studentId = (data.studentId || '').trim();
      if (!studentId) return res.status(400).json({ ok: false, error: 'Student ID is required.' });

      const sidExists = await User.findOne({ role: 'student', studentId });
      if (sidExists) return res.status(400).json({ ok: false, error: 'This student ID is already registered.' });

      newUserPayload.studentId = studentId;
      newUserPayload.batch = (data.batch || '').trim();
      newUserPayload.customId = makeId('stu');
    } else {
      const designation = data.designation || 'Lecturer';
      let supervisorId;

      if (data.profileChoice && data.profileChoice !== 'new') {
        const base = await SupervisorProfile.findOne({ profileId: String(data.profileChoice) });
        if (base) {
          const taken = await User.findOne({ role: 'supervisor', supervisorId: String(base.profileId) });
          if (taken) {
            return res.status(400).json({ ok: false, error: 'This directory profile is already linked to another account.' });
          }
          supervisorId = String(base.profileId);
          Object.assign(base, profileFields(data), {
            name,
            designation,
            department: deptLabel(department),
            email,
            phone: (data.phone || '').trim()
          });
          await base.save();
        }
      }

      if (!supervisorId) {
        supervisorId = makeId('sv');
        const newProf = new SupervisorProfile({
          profileId: supervisorId,
          custom: true,
          ...profileFields(data),
          name,
          designation,
          department: deptLabel(department),
          email,
          phone: (data.phone || '').trim()
        });
        await newProf.save();
      }

      newUserPayload.designation = designation;
      newUserPayload.supervisorId = supervisorId;
      newUserPayload.customId = makeId('sup');
    }

    const user = new User(newUserPayload);
    await user.save();

    res.status(201).json({ ok: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const user = await User.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!user) return res.status(404).json({ ok: false, error: 'User not found.' });

    const name = (data.name ?? user.name).trim();
    const email = (data.email ?? user.email).trim().toLowerCase();
    const department = (data.department ?? user.department) === 'EEE' ? 'EEE' : 'CSE';

    if (!name || !email) return res.status(400).json({ ok: false, error: 'Name and email are required.' });

    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) return res.status(400).json({ ok: false, error: 'Another user already uses this email.' });
      user.email = email;
    }

    user.name = name;
    user.department = department;
    user.phone = (data.phone ?? user.phone ?? '').trim();

    if (data.password) {
      if (data.password.length < 6) {
        return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
      }
      user.password = data.password;
    }

    if (user.role === 'student') {
      const studentId = (data.studentId ?? user.studentId).trim();
      if (!studentId) return res.status(400).json({ ok: false, error: 'Student ID is required.' });
      const sidExists = await User.findOne({ role: 'student', studentId, _id: { $ne: user._id } });
      if (sidExists) return res.status(400).json({ ok: false, error: 'Another student already uses this ID.' });
      user.studentId = studentId;
      user.batch = (data.batch ?? user.batch ?? '').trim();
    } else {
      user.designation = data.designation || user.designation;
      if (user.supervisorId) {
        const profile = await SupervisorProfile.findOne({ profileId: user.supervisorId });
        if (profile) {
          Object.assign(profile, profileFields(data), {
            name,
            email,
            designation: user.designation,
            department: deptLabel(department),
            phone: user.phone
          });
          await profile.save();
        }
      }
    }

    await user.save();
    res.json({ ok: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!user) return res.status(404).json({ ok: false, error: 'User not found.' });

    const userIdStr = user.customId || user._id.toString();

    if (user.role === 'student') {
      await SupervisionRequest.deleteMany({ studentUserId: userIdStr });
      await Notification.deleteMany({ recipient: `u:${userIdStr}` });
    } else {
      const supKey = `s:${user.supervisorId}`;
      const profile = await SupervisorProfile.findOne({ profileId: user.supervisorId });
      if (profile && profile.custom) {
        await SupervisorProfile.deleteOne({ profileId: user.supervisorId });
        await SupervisionRequest.deleteMany({ supervisorId: String(user.supervisorId) });
      }
      await Notification.deleteMany({ recipient: supKey });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
