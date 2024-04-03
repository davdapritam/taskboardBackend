const express = require("express");
const router = express.Router();
const { signup } = require("../models/signup.model");


router.post("/", async (req, res) => {
    try {
        const user = await signup.findOne({ email: req.body.email, password: req.body.password });

        if (user) {
            if (user.password === req.body.password) {
                res.status(200).json({ Status: 1, message: "Login Successfully", data: { token: user.token, id: user._id, role: user.role } });
            } else {
                res.status(201).json({ Status: 0, message: "Invalid Password" });
            }
        } else {
            res.status(201).json({ Status: 0, message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ Status: 0, message: "Something went wrong" });
    }
});

module.exports = router;