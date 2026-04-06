require('dotenv').config();
const express = require("express");
const cors = require("cors"); // Frontend se connect karne ke liye zaroori hai
const connectDB = require("./src/config/db");
const authRoutes = require('./src/routes/authRoutes');
const recordRoutes = require('./src/routes/recordRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const HttpError = require('./src/utils/httpError');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

connectDB();

const port = process.env.PORT || 3000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Finance Dashboard Backend is running perfectly');
});

// 404 Handler
app.use((req, res, next) => {
    next(new HttpError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});