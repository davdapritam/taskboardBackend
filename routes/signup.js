const express = require("express");
const { body, validationResult } = require("express-validator");
const { signup } = require("../models/signup.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage: storage });

function generateRandomToken() {
    return crypto.randomBytes(32).toString("hex");
}

const router = express.Router();

router.post(
    "/",
    upload.single("profilePic"),
    [
        body("email", "Enter Valid Email").isEmail(),
        body("mobileNo", "Mobile Number Should Not Be Less Than 10 Digits").isLength({ min: 10 }),
        body("mobileNo", "Mobile Number Should Not Be Greater Than 10 Digits").isLength({ max: 10 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(201).json({ errors: errors.array() });
        } else {
            try {
                const existingUser = await signup.findOne({
                    $or: [{ mobileNo: req.body.mobileNo }, { email: req.body.email }],
                });

                if (existingUser) {
                    return res.status(201).json({ Status: 0, message: "User already exists" });
                }
                const secretKey = generateRandomToken();

                jwt.sign(
                    { email: req.body.email, password: req.body.password },
                    secretKey,
                    { expiresIn: "1h" },
                    async (err, token) => {
                        if (err) {
                            return res.status(500).json({ Status: 2, error: "Failed to generate token" });
                        }

                        const body = {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            mobileNo: req.body.mobileNo,
                            email: req.body.email,
                            password: req.body.password,
                            token: token,
                        };

                        if (req.file) {
                            body.profilePic = req.file.filename;
                        }

                        const newUser = new signup(body);
                        await newUser.save();

                        res.status(200).json({
                            Status: 1,
                            message: "Registered successfully",
                            data: {
                                token: newUser.token,
                                id: newUser._id,
                                role: newUser.role,
                            },
                        });
                    }
                );
            } catch (error) {
                res.status(500).json({ Status: 2, message: "Something went wrong", error: error });
            }
        }
    }
);

module.exports = router;
