import { JwtPayload } from "jsonwebtoken";

export type UserRole = "ADMIN" | "USER";

export type AccessTokenPayload = JwtPayload & {
    id: string;
    role?: string;
};

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role?: string;
            };
        }
    }
}

export { };
