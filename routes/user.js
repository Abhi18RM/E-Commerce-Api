import express from "express";
import {
    verifyTokenAndAdmin,
    verifyTokenAndAuthorization,
} from "./verifyToken.js";
import CryptoJS from "crypto-js";
import User from "../models/User.js";

const router = express.Router();

//Update

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASSWORD_SECRET
        ).toString();
    }
    try {
        const UpdatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).send(UpdatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Delete

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).send("User has been deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).send(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get all users or 5 new users

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
        const user = query
            ? await User.find().sort({ _id: -1 }).limit(5)
            : await User.find();
        res.status(200).send(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Get user stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    tot: { $sum: 1 },
                },
            },
        ]);
        res.status(200).send(data);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
