import express from "express";
import stripePackage from "stripe";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

const router = express.Router();

router.post("/payment", async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        const options = {
            amount: req.body.amount,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        instance.orders.create(options, (err, order) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Error occured");
            }
            res.status(200).json({ data: order });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post("/verify", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");
        if (razorpay_signature === expectedSign) {
            return res
                .status(200)
                .json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature" });
        }
    } catch (err) {
        console.log(err);
    }
});

export default router;
