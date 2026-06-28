const jwt = require('jsonwebtoken');

/**
 * @desc    Middleware to verify JSON Web Token
 *          Protects routes and injects student ID/email into req.user
 */
const protect = (req, res, next) => {
  let token;

  // 1. Check if token is provided in the Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Attach decoded payload (contains student id and email) to the request object
      req.user = decoded;

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized: session token is invalid or expired.' });
    }
  }

  // 2. If no token is provided at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized: no session token provided.' });
  }
};

module.exports = { protect };
