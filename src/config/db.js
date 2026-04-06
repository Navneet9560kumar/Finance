const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI || typeof process.env.MONGO_URI !== 'string') {
        console.error(
            'MongoDB: MONGO_URI is missing or invalid. Add MONGO_URI to a .env file'
        );
        process.exit(1);
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;