
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { Forbidden, Unauthorized } from "../errors/http.error";
import { prisma } from "../configs/prisma";
import { AuthPayload } from "../schemas/auth.schema";


export const verifyToken = async (token: string) => {
    const decoded = jwt.decode(token, { complete: true }) as any;
    if (!decoded || !decoded.header?.kid) {
        throw new Unauthorized("Invalid token");
    }
    const apiKey = await prisma.apiKey.findUnique({
        where: { id: decoded.header.kid }
    });
    if (!apiKey) {
        throw new Unauthorized("ApiKey not found");
    }
    return jwt.verify(token, apiKey.publicKey, {
        algorithms: ["RS256"],
    }) as AuthPayload;
};
export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            throw new Unauthorized("Missing token")
        }
        const decoded = await verifyToken(accessToken);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
}
export const checkRole = (requireRole: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập")
            }
            if (req.user.role !== requireRole) {
                throw new Forbidden("Không có quyền truy cập")
            }
            next();
        } catch (error) {
            next(error)
        }
    }
}

