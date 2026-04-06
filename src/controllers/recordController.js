const Record = require('../models/Record');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../middlewares/asyncHandler'); // ✅ Import add kar diya

// @desc    Get all records with Advanced Search, Filtering & Sorting
const getRecords = asyncHandler(async (req, res, next) => {
    const { 
        search, 
        type, 
        category, 
        startDate, 
        endDate, 
        minAmount, 
        maxAmount, 
        sort 
    } = req.query;

    const queryFilter = {};

    // 1. Text Search (Notes ya Category mein partial match, case-insensitive)
    if (search) {
        queryFilter.$or = [
            { notes: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
        ];
    }

    // 2. Exact Matches
    if (type) {
        if (!['income', 'expense'].includes(type)) {
            return next(new HttpError(400, 'Invalid type'));
        }
        queryFilter.type = type;
    }
    
    // Agar text search nahi hai, par specific category chahiye
    if (category && !search) {
        queryFilter.category = category;
    }

    // 3. Date Range Filter (e.g., startDate=2024-03-01 & endDate=2024-03-31)
    if (startDate || endDate) {
        queryFilter.date = {};
        if (startDate) queryFilter.date.$gte = new Date(startDate);
        if (endDate) queryFilter.date.$lte = new Date(endDate);
    }

    // 4. Amount Range Filter (e.g., minAmount=1000 & maxAmount=5000)
    if (minAmount || maxAmount) {
        queryFilter.amount = {};
        if (minAmount) queryFilter.amount.$gte = Number(minAmount);
        if (maxAmount) queryFilter.amount.$lte = Number(maxAmount);
    }

    // 5. Sorting Logic (Default: Newest First)
    let sortObj = { date: -1 }; // -1 means descending (newest)
    if (sort === 'amount_asc') sortObj = { amount: 1 };
    else if (sort === 'amount_desc') sortObj = { amount: -1 };
    else if (sort === 'oldest') sortObj = { date: 1 };

    // Execute Query
    const records = await Record.find(queryFilter)
        .sort(sortObj)
        .populate('createdBy', 'name email');

    res.status(200).json({ 
        success: true, 
        count: records.length, 
        records 
    });
});

// ✅ asyncHandler mein wrap kiya
const createRecord = asyncHandler(async (req, res, next) => {
    const { amount, type, category, notes, date } = req.body;

    if (!amount || !type || !category) {
        return next(new HttpError(400, 'Please provide all required fields: amount, type, and category'));
    }

    if (amount <= 0) {
        return next(new HttpError(400, 'Amount must be greater than 0'));
    }

    if (type !== 'income' && type !== 'expense') {
        return next(new HttpError(400, 'Type must be either "income" or "expense"'));
    }

    const recordFields = {
        amount,
        type,
        category,
        notes,
        createdBy: req.user._id, // Middleware se exact user _id aayega
    };

    if (date) {
        recordFields.date = date;
    }

    const newRecord = new Record(recordFields);
    await newRecord.save();

    res.status(201).json({
        message: 'Record created successfully',
        record: newRecord
    });
});

// ✅ asyncHandler mein wrap kiya
const updateRecord = asyncHandler(async (req, res, next) => {
    const { amount, type, category, notes, date } = req.body;

    const payload = {};
    if (amount !== undefined) payload.amount = amount;
    if (type !== undefined) payload.type = type;
    if (category !== undefined) payload.category = category;
    if (notes !== undefined) payload.notes = notes;
    if (date) payload.date = date;

    const updatedRecord = await Record.findByIdAndUpdate(
        req.params.id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    if (!updatedRecord) {
        return next(new HttpError(404, 'Record not found'));
    }

    res.status(200).json({
        message: 'Record updated successfully',
        record: updatedRecord
    });
});

// ✅ asyncHandler mein wrap kiya
const deleteRecord = asyncHandler(async (req, res, next) => {
    const removed = await Record.findByIdAndDelete(req.params.id);

    if (!removed) {
        return next(new HttpError(404, 'Record not found'));
    }

    res.status(200).json({ message: 'Record deleted successfully' });
});

// ✅ asyncHandler mein wrap kiya
const getSummary = asyncHandler(async (req, res, next) => {
    const summary = await Record.aggregate([
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((item) => {
        if (item._id === 'income') totalIncome = item.totalAmount;
        if (item._id === 'expense') totalExpense = item.totalAmount;
    });

    const netBalance = totalIncome - totalExpense;

    let financialStatus = 'Balanced';
    if (netBalance > 0) financialStatus = 'Surplus (Profit)';
    else if (netBalance < 0) financialStatus = 'Deficit (Loss)';

    const categorySummary = await Record.aggregate([
        {
            $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
            },
        },
        {
            $project: {
                _id: 0,
                category: '$_id',
                totalAmount: 1,
            },
        },
    ]);

    const recentActivity = await Record.find()
        .sort({ date: -1 })
        .limit(5)
        .populate('createdBy', 'name');

    const monthlyTrends = await Record.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    type: '$type'
                },
                totalAmount: { $sum: '$amount' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
    ]);

    res.status(200).json({
        totalSummary: {
            totalIncome,
            totalExpense,
            netBalance,
            financialStatus,
        },
        categoryWiseTotals: categorySummary,
        recentActivity,
        monthlyTrends,
    });
});

module.exports = {
    createRecord,
    getRecords,
    getSummary,
    updateRecord,
    deleteRecord,
};