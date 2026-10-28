const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SupervisorProfile = require('../models/SupervisorProfile');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'iiuc_thesisverse_secret_key_2026', {
    expiresIn: '30d'
  });
};

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const deptLabel = (dept) => (dept === 'EEE' ? 'Dept. of EEE' : 'Dept. of CSE');

// @desc    Register a new user (Student or Supervisor)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { role = 'student', fullName, email, password, department = 'CSE', studentId, designation, profileChoice } = req.body;

    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';
    const cleanDept = department === 'EEE' ? 'EEE' : 'CSE';

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({ ok: false, error: 'Please fill in all required fields.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'An account with this email already exists. Please sign in.' });
    }

    let newUserPayload = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: role === 'supervisor' ? 'supervisor' : 'student',
      department: cleanDept
    };

    if (newUserPayload.role === 'student') {
      const cleanStudentId = (studentId || '').trim();
      if (!cleanStudentId) {
        return res.status(400).json({ ok: false, error: 'Please enter your student ID.' });
      }

      const existingStudent = await User.findOne({ role: 'student', studentId: cleanStudentId });
      if (existingStudent) {
        return res.status(400).json({ ok: false, error: 'This student ID is already registered.' });
      }

      newUserPayload.studentId = cleanStudentId;
      newUserPayload.customId = makeId('stu');
    } else {
      // Supervisor registration
      let supervisorId;
      const cleanDesignation = designation || 'Lecturer';

      if (profileChoice && profileChoice !== 'new') {
        const base = await SupervisorProfile.findOne({ profileId: String(profileChoice) });
        if (!base) {
          return res.status(400).json({ ok: false, error: 'Selected directory profile not found.' });
        }

        const isClaimed = await User.findOne({ role: 'supervisor', supervisorId: String(base.profileId) });
        if (isClaimed) {
          return res.status(400).json({ ok: false, error: 'This faculty profile is already linked to another account.' });
        }

        supervisorId = String(base.profileId);
        base.name = cleanName;
        base.designation = cleanDesignation;
        base.department = deptLabel(cleanDept);
        base.email = cleanEmail;
        await base.save();
      } else {
        supervisorId = makeId('sv');
        const newProfile = new SupervisorProfile({
          profileId: supervisorId,
          name: cleanName,
          designation: cleanDesignation,
          department: deptLabel(cleanDept),
          papers: 0,
          openSlots: 3,
          tags: [],
          email: cleanEmail,
          custom: true
        });
        await newProfile.save();
      }

      newUserPayload.designation = cleanDesignation;
      newUserPayload.supervisorId = supervisorId;
      newUserPayload.customId = makeId('sup');
    }

    const user = new User(newUserPayload);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      ok: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    const id = (identifier || '').trim().toLowerCase();

    if (!id || !password) {
      return res.status(400).json({ ok: false, error: 'Please enter your ID/email and password.' });
    }

    const user = await User.findOne({
      $or: [
        { email: id },
        { studentId: (identifier || '').trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ ok: false, error: 'No account found. Please register first.' });
    }

    if (role && user.role !== role) {
      return res.status(400).json({
        ok: false,
        error: `This account is registered as a ${user.role}. Switch the role above and try again.`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Incorrect password.' });
    }

    const token = generateToken(user._id);

    res.json({
      ok: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    res.json({ ok: true, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { account = {}, supervisorProfile, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const name = (account.name ?? user.name).trim();
    const email = (account.email ?? user.email).trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }

    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ ok: false, error: 'Another account already uses this email.' });
      }
      user.email = email;
    }

    user.name = name;
    if (account.department) user.department = account.department;
    if (account.phone !== undefined) user.phone = account.phone.trim();

    if (user.role === 'student' && account.studentId !== undefined) {
      const sid = account.studentId.trim();
      if (!sid) return res.status(400).json({ ok: false, error: 'Student ID cannot be empty.' });
      const sidExists = await User.findOne({ role: 'student', studentId: sid, _id: { $ne: user._id } });
      if (sidExists) {
        return res.status(400).json({ ok: false, error: 'Another student already uses this ID.' });
      }
      user.studentId = sid;
      if (account.batch !== undefined) user.batch = account.batch.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ ok: false, error: 'Current password is required to set a new password.' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ ok: false, error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ ok: false, error: 'New password must be at least 6 characters.' });
      }
      user.password = newPassword;
    }

    await user.save();

    if (user.role === 'supervisor' && supervisorProfile && user.supervisorId) {
      const profile = await SupervisorProfile.findOne({ profileId: user.supervisorId });
      if (profile) {
        if (supervisorProfile.papers !== undefined) profile.papers = Math.max(0, Number(supervisorProfile.papers) || 0);
        if (supervisorProfile.openSlots !== undefined) profile.openSlots = Math.max(0, Number(supervisorProfile.openSlots) || 0);
        if (supervisorProfile.tags !== undefined) {
          profile.tags = Array.isArray(supervisorProfile.tags)
            ? supervisorProfile.tags
            : String(supervisorProfile.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
        }
        if (supervisorProfile.bio !== undefined) profile.bio = supervisorProfile.bio.trim();
        if (supervisorProfile.scholar !== undefined) profile.scholar = supervisorProfile.scholar.trim();
        if (supervisorProfile.researchgate !== undefined) profile.researchgate = supervisorProfile.researchgate.trim();
        if (supervisorProfile.linkedin !== undefined) profile.linkedin = supervisorProfile.linkedin.trim();
        if (supervisorProfile.phone !== undefined) profile.phone = supervisorProfile.phone.trim();
        profile.name = name;
        profile.email = email;
        await profile.save();
      }
    }

    res.json({ ok: true, user: user.toJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error updating profile' });
  }
};
