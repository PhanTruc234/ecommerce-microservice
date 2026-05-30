import { prisma } from "../configs/prisma";
import { BadRequest, Unauthorized } from "../errors/http.error";
import { AuthRequest, LoginDto, RegisterDto } from "../schemas/auth.schema";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { createApiKey } from "./apiKey.service";
import { createAccessToken, createRefreshToken } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library"
import { verifyToken } from "../middlewares/auth.middleware";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class AuthService {
    async getMe(data: AuthRequest) {
        const { id, role } = data
        const findUser = await prisma.user.findFirst({
            where: {
                id
            }
        })
        if (!findUser) {
            throw new Unauthorized("Tài khoản không tồn tại")
        }
        return {
            name: findUser.name,
            email: findUser.email,
            role,
            avatar: findUser.avatar,
            ward: findUser.ward,
            phone: findUser.phone,
            address: findUser.address,
            avatarPublicId: findUser.avatarPublicId,
            province: findUser.province
        }
    }
    async register(data: RegisterDto) {
        const { name, email, password } = data
        if (!name || !email || !password) {
            throw new BadRequest("Thiếu thông tin đăng kí")
        }
        const existUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (existUser) {
            throw new BadRequest("Người dùng đã tồn tại")
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                avatar: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
                provider: "local"
            }
        })
        return {
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }
    }
    async login(data: LoginDto) {
        const { email, password } = data;
        if (!email || !password) {
            throw new BadRequest("Thiếu thông tin");
        }
        const findUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!findUser) {
            throw new Unauthorized("Thông tin tài khoản không chính xác")
        }
        if (!findUser.password) {
            throw new BadRequest("Thiếu password")
        }
        const decryptPass = await bcrypt.compare(password, findUser.password);
        if (!decryptPass) {
            throw new Unauthorized("Thông tin mật khẩu không chính xác")
        }
        await createApiKey(findUser.id);
        const accessToken = await createAccessToken({ id: findUser.id, role: findUser.role })
        const refreshToken = await createRefreshToken({ id: findUser.id })
        return {
            accessToken,
            refreshToken,
            user: {
                id: findUser.id,
                name: findUser.name,
                email: findUser.email,
                role: findUser.role,
                avatar: findUser.avatar
            }
        };
    }
    async loginWithGoogle(credential: string) {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new BadRequest("Invalid Google token");
        }
        if (!payload.email_verified) {
            throw new BadRequest("Email chưa được xác minh");
        }
        const { sub, email, name, picture } = payload;
        if (!name) throw new BadRequest("Thiếu tên");
        if (!email) throw new BadRequest("Missing email");
        let newUser = await prisma.user.findFirst({
            where: {
                googleId: sub
            }
        })
        if (!newUser) {
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    avatar: picture,
                    googleId: sub,
                    provider: 'google'
                }
            });
        }
        await createApiKey(newUser.id);
        const accessToken = await createAccessToken({ id: newUser.id, role: newUser.role })
        const refreshToken = await createRefreshToken({ id: newUser.id })
        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar
            }
        };
    }
    async refreshToken(token: string) {
        if (!token) {
            throw new Unauthorized("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
        }
        const decode = await verifyToken(token)
        if (!decode) {
            throw new Unauthorized("Phiên đăng nhập đã hết, vui lòng đăng nhập lại")
        }
        const infoUser = await prisma.user.findFirst({
            where: {
                id: decode.id
            }
        })
        if (!infoUser) {
            throw new Unauthorized("Không tìm thấy tài khoản")
        }
        const accessToken = await createAccessToken({ id: decode.id, role: infoUser.role })
        return {
            accessToken,
            user: {
                id: infoUser.id,
                name: infoUser.name,
                email: infoUser.email,
                role: infoUser.role,
                avatar: infoUser.avatar
            }
        }
    }
    async logout(refreshToken: string) {
        if (!refreshToken) {
            throw new Unauthorized("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
        };
        const decoded = jwt.decode(refreshToken, { complete: true }) as any;
        const keyId = decoded.header?.kid
        if (!decoded || !keyId) {
            throw new Unauthorized("Phiên đăng nhập đã hết, vui lòng đăng nhập lại");
        }
        await prisma.apiKey.delete({
            where: {
                id: keyId
            }
        })
    }
}
export default new AuthService()

