import { NextFunction, Request, Response } from "express";
import ResponseHandler from "../common/response.handler";
import { LoginDto, RegisterDto } from "../schemas/auth.schema";
import { Unauthorized } from "../errors/http.error";
import authService from "../services/auth.service";

class AuthController extends ResponseHandler {
    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req?.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }
            const { id, role } = req?.user;
            const data = await authService.getMe({ id, role })
            return this.ok(res, {
                user: {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    avatar: data.avatar,
                    ward: data.ward,
                    phone: data.phone,
                    address: data.address,
                    avatarPublicId: data.avatarPublicId,
                    province: data.province
                }
            }, "Lấy dữ liệu thành công")
        } catch (error) {
            next(error)
        }
    }
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password }: RegisterDto = req.body
            const createAccount = await authService.register({ name, email, password })
            return this.created(
                res,
                {
                    user: {
                        id: createAccount.user.id,
                        name: createAccount.user.name,
                        email: createAccount.user.email,
                        role: createAccount.user.role,
                    }
                },
                "Đăng kí thành công"
            );
        } catch (error) {
            next(error)
        }
    }
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password }: LoginDto = req.body
            const loginAccount = await authService.login({ email, password })
            res.cookie('accessToken', loginAccount.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000
            })
            res.cookie("refreshToken", loginAccount.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 30 * 60 * 1000,
            });
            return this.ok(
                res,
                {
                    accessToken: loginAccount.accessToken,
                    user: {
                        id: loginAccount.user.id,
                        name: loginAccount.user.name,
                        email: loginAccount.user.email,
                        role: loginAccount.user.role,
                        avatar: loginAccount.user.avatar
                    }
                },
                "Đăng nhập thành công"
            );
        } catch (error) {
            next(error)
        }
    }
    loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { credential } = req.body;
            const data = await authService.loginWithGoogle(credential)
            res.cookie('accessToken', data.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000
            })
            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 30 * 60 * 1000,
            });
            return this.created(
                res,
                {
                    accessToken: data.accessToken,
                    user: {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role,
                        avatar: data.user.avatar
                    }
                },
                "Đăng nhập thành công"
            );
        } catch (error) {
            next(error)
        }
    }
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken
            const dataRefresh = await authService.refreshToken(refreshToken)
            res.cookie('accessToken', dataRefresh.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000
            })
            return this.ok(
                res,
                {
                    user: {
                        id: dataRefresh.user.id,
                        name: dataRefresh.user.name,
                        email: dataRefresh.user.email,
                        role: dataRefresh.user.role,
                        avatar: dataRefresh.user.avatar
                    }
                },
                "Lấy accessToken thành công"
            );
        } catch (error) {
            next(error)
        }
    }
    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken
            const data = await authService.logout(refreshToken)
            res.clearCookie("refreshToken")
            res.clearCookie("accessToken")
            return this.ok(res, null, "Đăng xuất thành công")
        } catch (error) {
            next(error)
        }
    }
}
export default new AuthController()

