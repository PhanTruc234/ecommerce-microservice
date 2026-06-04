import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
    (schema: ZodSchema, type: "body" | "params" | "query" | "file" = "body") =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const data =
                    type === "params"
                        ? req.params
                        : type === "query"
                            ? req.query
                            : type === "file"
                                ? (req as any).file
                                : req.body;
                const parsed = schema.parse(data);
                if (type === "file") (req as any).file = parsed as any
                if (type === "body") req.body = parsed;
                if (type === "params") req.params = parsed as any;
                if (type === "query") (req as any).validatedQuery = parsed;
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(400).json({
                        message: "Xác thực thất bại",
                        errors: error.issues.map((e) => ({
                            path: e.path.join("."),
                            msg: e.message,
                        })),
                    });
                }
                return res.status(400).json({
                    message: "Invalid request format",
                });
            }
        };
