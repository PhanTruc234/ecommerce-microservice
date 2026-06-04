import { NextFunction, Request, Response } from "express";
import ResponseHandler from "../common/response.handler";
import { Unauthorized } from "../errors/http.error";
import cartService from "../services/cart.service";


class CartController extends ResponseHandler {
    getCarts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập")
            }
            const userId = req.user.id
            const data = await cartService.getCarts(userId, req.query)
            return this.ok(res, data, "Lấy giỏ hàng thành công")
        } catch (error) {
            next(error)
        }
    }
    addCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập")
            }
            const userId = req.user.id
            const data = await cartService.addCart(userId, req.body)
            return this.created(res, data, "Thêm giỏ hàng thành công")
        } catch (error) {
            next(error)
        }
    }
    updateCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập")
            }
            const userId = req.user.id
            const { id } = req.params as { id: string }
            const data = await cartService.updateCart(userId, req.body, id)
            return this.ok(res, data, "Sửa giỏ hàng thành công")
        } catch (error) {
            next(error)
        }
    }
    deleteCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập")
            }
            const userId = req.user.id
            const { id } = req.params as { id: string }
            const data = await cartService.deleteCart(userId, id)
            return this.ok(res, data, "Xóa thành công")
        } catch (error) {
            next(error)
        }
    }
}
export default new CartController()