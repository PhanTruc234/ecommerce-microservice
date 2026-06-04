import express from "express";
import orderController from "../controllers/order.controller";
import { authUser, checkRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    checkoutPreviewSchema,
    createOrderSchema,
    getOrdersSchema,
    updateOrderSchema,
} from "../schemas/order.shema";

const route = express.Router();

route.post("/checkout/preview", authUser, validate(checkoutPreviewSchema, "body"),
    orderController.previewCheckout);

route.post("/", authUser, validate(createOrderSchema, "body"), orderController.createOrder);

route.get("/me", authUser, validate(getOrdersSchema, "query"), orderController.getMyOrders);

route.get("/", authUser, checkRole("ADMIN"), validate(getOrdersSchema, "query"), orderController.getAllOrders);

route.patch("/:id", authUser, checkRole("ADMIN"), validate(updateOrderSchema, "body"), orderController.updateOrder);

export default route;
