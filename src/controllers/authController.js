const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../middlewares/asyncHandler'); // ✅ Import add kiya

const registerUser = asyncHandler(async (req, res, next) => {
    const { name, password, role } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!name || !email || !password) {
        return next(new HttpError(400, 'Name, email, and password are required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new HttpError(400, 'Please enter a valid email address'));
    }

    if (password.length < 6) {
        return next(new HttpError(400, 'Password must be at least 6 characters long'));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new HttpError(400, 'A user with this email already exists'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'Viewer',
    });

    await newUser.save();

    res.status(201).json({
        message: 'User registered successfully!',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        },
    });
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || !password) {
        return next(new HttpError(400, 'Email and password are required'));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new HttpError(400, 'Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new HttpError(400, 'Invalid email or password'));
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            role: user.role,
        },
    });
});

module.exports = { registerUser, loginUser };