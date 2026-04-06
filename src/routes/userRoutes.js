// routes/userRoutes.js  

const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
} = require('../controllers/userController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');

// All routes are accessible to Admin only
router.get('/',            protect, authorize('Admin'), asyncHandler(getAllUsers));
router.put('/:id/role',    protect, authorize('Admin'), asyncHandler(updateUserRole));
router.put('/:id/status',  protect, authorize('Admin'), asyncHandler(updateUserStatus));
router.delete('/:id',      protect, authorize('Admin'), asyncHandler(deleteUser));

module.exports = router;