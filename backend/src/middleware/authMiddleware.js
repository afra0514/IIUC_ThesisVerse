const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Not authorized, no token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'iiuc_thesisverse_secret_key_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      // If not JWT, check if it's a direct user/admin ID (e.g. from session)
      const directUser = await User.findOne({
        $or: [{ customId: token }, { _id: token.match(/^[0-9a-fA-F]{24}$/) ? token : null }]
      });
      if (directUser) {
        req.user = directUser;
        return next();
      }
      return res.status(401).json({ ok: false, error: 'Session expired or invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ ok: false, error: 'User account not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ ok: false, error: 'Not authorized, token verification failed' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: `Forbidden: requires one of the following roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  requireRole,
  adminOnly: requireRole('admin'),
  supervisorOnly: requireRole('supervisor'),
  studentOnly: requireRole('student')
};
