const express = require('express');
const router = express.Router();
const { signup } = require('../models/signup.model');

const authenticateToken = async (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ Status: 0, message: "Unauthorized: No token provided" });
    }

    const user = await signup.findOne({ token: token });

    if (!user) {
        return res.status(401).json({ Status: 0, message: "Invalid Token" });
    }

    req.user = user;
    next();
};

router.get('/getUserById/:id', async (req, res) => {
    try {

        const userId = req.params.id;
        const user = await signup.findOne({ _id: userId });

        if (!user) {
            return res.status(201).json({ Status: 0, message: "User Does Not Exists" });
        }

        res.status(200).json({ Status: 1, data: user })
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });
    }
});

router.get('/getUserByToken/:token', async (req, res) => {

    try {

        const token = req.params.token;
        const user = await signup.findOne({ token: token });

        if (!user) {
            return res.status(201).json({ Status: 0, message: "User Does Not Exists" });
        }

        res.status(200).json({ Status: 1, data: user })
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });
    }

});

const multer = require('multer');
const upload = multer({ dest: '/Users/davdapritam/Desktop/upmetrics/taskApp/src/assets/profilePhotos' });

router.put('/update/:id', authenticateToken, upload.single('profilePhoto'), async (req, res) => {

    try {

        const user = await signup.findById(req.params.id);

        if (!user) {
            return res.status(201).json({ Status: 0, message: "User not found" });
        }

        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.mobileNo = req.body.mobileNo;
        user.email = req.body.email;
        user.password = req.body.password;

        if (req.file) {
            user.profilePic = req.file.filename;
        }

        await user.save();

        res.status(200).json({
            Status: 1,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });
    }
});

router.get('/getAllUsers', async (req, res) => {
    try {

        const users = await signup.find();

        const updatedUser = users.map((item) => ({
            email: item.email,
            _id: item._id,
            firstName: item.firstName,
            lastName: item.lastName,
        }))

        if (!users) {
            return res.status(201).json({ Status: 0, message: "Users Not Found" });
        }

        res.status(200).json({ Status: 1, data: updatedUser });

    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });

    }
})

router.get('/checkUser/:number', async (req, res) => {
    try {
        const mobileNo = req.params.number
        const user = await signup.find({ mobileNo });

        if (!user) {
            return res.status(201).json({ Status: 0, message: "Users Not Found" });
        }

        res.status(200).json({ Status: 1, data: user[0]._id, message: 'User Exists' });

    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });
    }
})

router.post('/changePassword', async (req, res) => {
    try {
        const { mobileNo, newPassword } = req.body;

        const user = await signup.findOne({ mobileNo });

        if (!user) {
            return res.status(201).json({ Status: 0, message: "Users Not Found" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ Status: 1, data: user, message: 'Password Update Successfully' });

    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong", error: error });
    }
})

module.exports = router;