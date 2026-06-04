import { Response } from "express";

class ResponseHandler {
    ok(res: Response, data: unknown, message: string) {
        return res.status(200).json({ message, data })
    }
    created(res: Response, data: unknown, message: string) {
        return res.status(201).json({ message, data })
    }
}
export default ResponseHandler