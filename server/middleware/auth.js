// Protects routes: requires an "Authorization: Bearer <token>" header with a valid JWT.
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  next();
};
