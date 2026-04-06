const express = require('express');
const router = express.Router();
const {
    createRecord,
    getRecords,
    getSummary,
    updateRecord,
    deleteRecord,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');

router.get(
    '/summary',
    protect,
    authorize('Viewer', 'Analyst', 'Admin'),
    asyncHandler(getSummary)
);

router.get(
    '/',
    protect,
    authorize('Analyst', 'Admin'),
    asyncHandler(getRecords)
);

router.post('/', protect, authorize('Admin'), asyncHandler(createRecord));
router.put('/:id', protect, authorize('Admin'), asyncHandler(updateRecord));
router.delete('/:id', protect, authorize('Admin'), asyncHandler(deleteRecord));

module.exports = router;
