import { AuthPayload } from "../schemas/auth.schema";
import { Multer } from "multer";
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
            file?: Multer.File;
        }
    }
}
export { };

