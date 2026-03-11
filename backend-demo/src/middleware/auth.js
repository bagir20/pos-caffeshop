const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-pos-caffeshop';

module.exports = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};
