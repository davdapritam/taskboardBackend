const mongoose = require('mongoose');

const SignupSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'firstName Required']
    },
    lastName: {
        type: String,
        required: [true, 'lastName Required']
    },
    mobileNo: {
        type: String,
        required: [true, 'mobileNo Required']
    },
    email: {
        type: String,
        required: [true, 'Email Required']
    },
    password: {
        type: String,
        required: [true, 'Password Required']
    },
    profilePic: {
        type: String,
        required: [false]
    },
    token: {
        type: String,
        required: [true, "Token Required"]
    }
}, { timestamps: true });

const signup = mongoose.model('Signup', SignupSchema);

module.exports = { signup }