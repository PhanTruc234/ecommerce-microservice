import { NextFunction, Request, Response } from "express";
type ErrorType = {
    statusCode?: number,
    message?: string
}
export const errorHandler = (err: ErrorType, req: Request, res: Response, next: NextFunction) => {
    return res.status(err?.statusCode || 500).json({
        message: err?.message
    })
}   