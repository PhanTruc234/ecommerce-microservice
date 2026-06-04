import express from "express"
import { addCart, updateCart } from "../schemas/cart.schema"
import cartController from "../controllers/cart.controller"
import { authUser } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"

const route = express.Router()


route.get("/", authUser, cartController.getCarts)


route.post("/", authUser, validate(addCart, "body"), cartController.addCart)


route.patch("/:id", authUser, validate(updateCart, "body"), cartController.updateCart)


route.delete("/:id", authUser, cartController.deleteCart)


export default route
