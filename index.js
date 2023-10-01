import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import authRoute from "./routes/auth.js";
import productRoute from "./routes/products.js";
import cartRoute from "./routes/cart.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/razorpay.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB connection successfull"))
    .catch((err) => console.log(err));

app.get("/user", (req, res) => res.send("hello"));

app.use(cors());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", paymentRoute);

app.listen(process.env.PORT || 8800, () =>
    console.log("Backend server is running")
);
