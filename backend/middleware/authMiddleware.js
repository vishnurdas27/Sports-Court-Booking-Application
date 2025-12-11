const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 1. Verify Token (Is user logged in?)
const protect = async (req, res, next) => {
  let token;

  // Check for "Bearer <token>" header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Decode token to get User ID
      // NOTE: Make sure 'your_secret_key_123' matches what you used in authController.js!
      const decoded = jwt.verify(token, 'your_secret_key_123'); // Replace with process.env.JWT_SECRET if using .env

      // Get user from DB (exclude password)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next(); // Move to the next function (the controller)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Admin Check (Is user an admin?)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };