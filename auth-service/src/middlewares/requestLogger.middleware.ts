import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import hemera from "../configs/hemera";

export const requestLogger = (service: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const requestId =
            req.headers["x-request-id"]?.toString() || crypto.randomUUID();

        req.headers["x-request-id"] = requestId;

        try {
            await hemera.act({
                topic: "observability",
                cmd: "log",
                service,
                requestId,
                method: req.method,
                path: req.originalUrl,
                message: "request received",
                timestamp: Date.now(),
            });
        } catch {
            console.log([LOG] cannot send log to observability-service);
        }

        next();
    };
};
