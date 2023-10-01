import express from "express";
import {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndAuthorization,
} from "./verifyToken.js";
import CryptoJS from "crypto-js";
import Order from "../models/Order.js";

const router = express.Router();

//Create order

router.post("/", verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update order

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).send(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Delete order

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).send("Order has been deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user orders

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        orders.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.status(200).send(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get all

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).send(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

//latest 5

router.get("/latest", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        orders.sort((a, b) => {
            return b.createdAt - a.createdAt;
        })
        const latestOrders = orders.slice(0, 5);
        res.status(200).send(latestOrders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// get monthly income

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
        new Date().setMonth(lastMonth.getMonth() - 1)
    );
    try {
        const income = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonth },
                    ...(productId && {
                        "products.productId": productId,
                    }),
                },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        income.sort((a, b) => a._id - b._id);
        res.status(200).send(income);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
