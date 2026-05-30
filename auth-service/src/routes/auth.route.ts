

import express from "express"
import { authUser } from "../middlewares/auth.middleware"
import authController from "../controllers/auth.controller"
import { validate } from "../middlewares/validate.middleware"
import { loginSchema, registerSchema } from "../schemas/auth.schema"
const route = express.Router()
route.get("/me", authUser, authController.getMe)
route.post("/register", validate(registerSchema, "body"), authController.register)
route.post("/login", validate(loginSchema, "body"), authController.login)
route.post("/google", authController.loginWithGoogle)
route.get("/logout", authController.logout)
route.get("/refresh", authController.refreshToken)
export default route

