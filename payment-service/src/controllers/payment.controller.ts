import ResponseHandler from "../common/response.handler";
import { Unauthorized } from "../errors/http.error";
import paymentService from "../services/payment.service";
import { NextFunction, Request, Response } from "express";

class PaymentController extends ResponseHandler {
    createPaymentLink = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }

            const data = await paymentService.createPaymentLink(
                req.user.id,
                req.params.orderId as string
            );
            return this.created(res, data, "Tạo link thanh toán PayOS thành công");
        } catch (error) {
            next(error);
        }
    };

    getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chua dang nhap");
            }
            const data = await paymentService.getPaymentStatus(
                req.user.id,
                req.params.orderId as string
            );
            return this.ok(res, data, "Lay trang thai thanh toan thanh cong");
        } catch (error) {
            next(error);
        }
    };

    payosWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await paymentService.handleWebhook(req.body);
            return this.ok(res, data, "Xử lý webhook PayOS thành công");
        } catch (error) {
            next(error);
        }
    };

    confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chua dang nhap");
            }

            const data = await paymentService.confirmPayment(
                req.user.id,
                req.body.orderId,
                req.body.payosOrderCode
            );

            return this.ok(res, data, "Xac nhan thanh toan thanh cong");
        } catch (error) {
            next(error);
        }
    };
}

export default new PaymentController();
