import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Forbidden, Unauthorized } from "../errors/http.error";

import hemera from "../config/hemera";
import { AccessTokenPayload, UserRole } from "../types/express";
const isUserRole = (role: unknown): role is UserRole => {
    return role === "ADMIN" || role === "USER";
};

const isAccessTokenPayload = (payload: JwtPayload): payload is AccessTokenPayload => {
    return typeof payload.id === "string" && isUserRole(payload.role);
};

const getPublicKey = async (kid: string) => {
    const result = await hemera.act<{ publicKey: string }>({
        topic: "auth",
        cmd: "getPublicKey",
        kid,
    });
    return result.data.publicKey;
};
export const verifyToken = async (token: string) => {
    const decoded = jwt.decode(token, { complete: true }) as any;

    if (!decoded || !decoded.header?.kid) {
        throw new Unauthorized("Invalid token");
    }

    const publicKey = await getPublicKey(decoded.header.kid);

    if (!publicKey) {
        throw new Unauthorized("ApiKey not found");
    }

    const payload = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
    });

    if (typeof payload === "string") {
        throw new Unauthorized("Invalid token");
    }

    if (!isAccessTokenPayload(payload)) {
        throw new Unauthorized("Invalid token payload");
    }

    return payload;
};

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken;

        if (!accessToken) {
            throw new Unauthorized("Missing token");
        }

        req.user = await verifyToken(accessToken);
        next();
    } catch (error) {
        next(error);
    }
};

export const checkRole = (requireRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new Unauthorized("Chưa đăng nhập");
            }

            if (req.user.role !== requireRole) {
                throw new Forbidden("Không có quyền truy cập");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
