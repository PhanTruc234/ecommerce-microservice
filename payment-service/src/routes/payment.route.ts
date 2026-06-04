import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import paymentController from "../controllers/payment.controller";


const route = express.Router();
route.post("/confirm", authUser, paymentController.confirmPayment);
route.post("/webhook", paymentController.payosWebhook);
route.get("/:orderId/status", authUser, paymentController.getPaymentStatus);
route.post("/:orderId", authUser, paymentController.createPaymentLink);

export default route;
