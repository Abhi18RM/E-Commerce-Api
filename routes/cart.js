import express from "express";
import {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndAuthorization,
} from "./verifyToken.js";
import Cart from "../models/Cart.js";

const router = express.Router();

//Create cart

router.post("/", verifyToken, async (req, res) => {
    const newCart = new Cart(req.body);
    try {
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update cart

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).send(updatedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Delete cart

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).send("Cart has been deleted");
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user cart

router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.status(200).send(cart);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get all

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).send(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
