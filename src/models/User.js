const mongoose = require("mongoose");

const userSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Viewer', 'Analyst', 'Admin'],// Srif yahi 3 role allow hai bas 

        default: 'Viewer'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});// // timestamps true karne se createdAt aur updatedAt apne aap ban jayenge

module.exports = mongoose.model('User', userSchema);