const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect Middleware
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from DB and check if the account is active
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!user.isActive) {
                return res.status(403).json({ message: 'Your account has been deactivated' });
            }

            // CORRECTION: Assign the full user object, not just decoded token
            req.user = user; 
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token is invalid' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token provided' });
};

// Authorize Middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not allowed to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };