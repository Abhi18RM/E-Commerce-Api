import express from "express";
import User from "../models/User.js";
import CryptoJS from "crypto-js";
import Jwt from "jsonwebtoken";

const router = express.Router();

//Register
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASSWORD_SECRET
        ).toString(),
    });
    try {
        const savedUser = await newUser.save();
        res.status(200).send(savedUser);
    } catch (err) {
        res.status(500).send(savedUser);
    }
});

//login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        const hashedPass = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASSWORD_SECRET
        ).toString(CryptoJS.enc.Utf8);

        if (req.body.password !== hashedPass) {
            return res.status(401).send("Wrong Credentials!");
        }

        const accessToken = Jwt.sign(
            {
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        const { password, ...others } = user._doc;

        res.status(200).send({ ...others, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
