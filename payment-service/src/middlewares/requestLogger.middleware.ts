import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import hemera from "../config/hemera";

export const requestLogger = (service: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const startedAt = Date.now();

        const requestId =
            req.headers["x-request-id"]?.toString() || crypto.randomUUID();

        req.headers["x-request-id"] = requestId;
        res.setHeader("x-request-id", requestId);

        res.on("finish", async () => {
            const durationMs = Date.now() - startedAt;

            try {
                await hemera.act({
                    topic: "observability",
                    cmd: "log",
                    service,
                    requestId,
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: res.statusCode,
                    durationMs,
                    message: "request completed",
                    timestamp: Date.now(),
                });
            } catch {
                console.log("[LOG] cannot send log to observability-service");
            }
        });

        next();
    };
};