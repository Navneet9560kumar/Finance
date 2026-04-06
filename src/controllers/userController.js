const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../middlewares/asyncHandler'); // ✅ Import add kiya

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
});

const updateUserRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    const allowedRoles = ['Viewer', 'Analyst', 'Admin'];

    if (!role || !allowedRoles.includes(role)) {
        return next(new HttpError(400, 'Role must be one of: Viewer, Analyst, or Admin'));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    ).select('-password');

    if (!user) {
        return next(new HttpError(404, 'User not found'));
    }

    res.status(200).json({
        message: 'User role updated successfully',
        user
    });
});

const updateUserStatus = asyncHandler(async (req, res, next) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return next(new HttpError(400, 'isActive must be either true or false'));
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    ).select('-password');

    if (!user) {
        return next(new HttpError(404, 'User not found'));
    }

    res.status(200).json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user
    });
});

const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new HttpError(404, 'User not found'));
    }

    res.status(200).json({
        message: 'User deleted successfully'
    });
});

module.exports = {
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser
};