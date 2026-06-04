import { NextFunction, Request, Response } from "express";
import ResponseHandler from "../common/response.handler";
import { Unauthorized } from "../errors/http.error";
import orderService from "../services/order.service";

class OrderController extends ResponseHandler {
    previewCheckout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }

            const data = await orderService.previewCheckout(req.user.id, req.body);
            return this.ok(res, data, "Xem trước thanh toán thành công");
        } catch (error) {
            next(error);
        }
    };

    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }

            const data = await orderService.createOrder(req.user.id, req.body);
            return this.created(res, data, "Tạo đơn hàng thành công");
        } catch (error) {
            next(error);
        }
    };

    getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }

            const query = (req as any).validatedQuery || req.query;
            const data = await orderService.getMyOrders(req.user.id, query as any);
            return this.ok(res, data, "Lấy đơn hàng của tôi thành công");
        } catch (error) {
            next(error);
        }
    };

    getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = (req as any).validatedQuery || req.query;
            const data = await orderService.getAllOrder(query as any);
            return this.ok(res, data, "Lấy danh sách đơn hàng thành công");
        } catch (error) {
            next(error);
        }
    };

    updateOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const data = await orderService.updateOrder(id, req.body);
            return this.ok(res, data, "Cập nhật đơn hàng thành công");
        } catch (error) {
            next(error);
        }
    };
}

export default new OrderController();
