require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User'); // Path check kar lena
const Record = require('./src/models/Record'); // Path check kar lena

const seedDatabase = async () => {
    try {
        // 1. Connect to Database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // 2. Clear existing data
        await User.deleteMany();
        await Record.deleteMany();
        console.log('Old data cleared!');

        // 3. Create Dummy Passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 4. Create Users (All Roles)
        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'Admin',
                isActive: true
            },
            {
                name: 'Analyst User',
                email: 'analyst@test.com',
                password: hashedPassword,
                role: 'Analyst',
                isActive: true
            },
            {
                name: 'Viewer User',
                email: 'viewer@test.com',
                password: hashedPassword,
                role: 'Viewer',
                isActive: true
            }
        ]);

        console.log('Dummy Users Created!');

        // Get the Admin user's ID to assign as the creator of the records
        const adminId = users[0]._id;

        // 5. Create Dummy Records
        const records = await Record.insertMany([
            {
                amount: 50000,
                type: 'income',
                category: 'Salary',
                notes: 'March Salary',
                date: new Date('2024-03-01'),
                createdBy: adminId
            },
            {
                amount: 15000,
                type: 'expense',
                category: 'Rent',
                notes: 'Office Rent',
                date: new Date('2024-03-05'),
                createdBy: adminId
            },
            {
                amount: 5000,
                type: 'expense',
                category: 'Food',
                notes: 'Team Lunch',
                date: new Date('2024-03-10'),
                createdBy: adminId
            },
            {
                amount: 20000,
                type: 'income',
                category: 'Freelance',
                notes: 'Client Project X',
                date: new Date('2024-03-15'),
                createdBy: adminId
            },
            {
                amount: 3000,
                type: 'expense',
                category: 'Utilities',
                notes: 'Electricity Bill',
                date: new Date('2024-03-18'),
                createdBy: adminId
            }
        ]);

        console.log(`Successfully seeded ${records.length} dummy records!`);
        console.log('Database Seeding Completed Successfully! 🌱');
        process.exit();
    } catch (error) {
        console.error('Error with seeding database: ', error);
        process.exit(1);
    }
};

seedDatabase();