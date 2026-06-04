import fs from 'fs';
import express from "express"

import path from 'path';
import multer from 'multer';
import { authUser, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import brandController from '../controllers/brand.controller';
import { brandParamsSchema, createBrandSchema, updateBrandSchema } from '../schemas/brand.schema';
const route = express.Router()
const uploadPath = path.join(process.cwd(), "uploads/brands");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ cho phép upload ảnh JPG, PNG, WEBP"));
        }
    },
});
route.post("/", authUser, checkRole("ADMIN"), validate(createBrandSchema, "body"), brandController.addBrand)
route.get("/", authUser, brandController.getBrands)
route.post("/upload", authUser, checkRole("ADMIN"), upload.single("logo-brand"), brandController.uploadLogoBrand)
route.patch("/:id", authUser, checkRole("ADMIN"), validate(brandParamsSchema, "params"), validate(updateBrandSchema, "body"), brandController.updateBrand)
route.delete("/temp", authUser, checkRole("ADMIN"), brandController.deleteLogoBrandTemp)
route.delete("/:id", authUser, checkRole("ADMIN"), validate(brandParamsSchema, "params"), brandController.deleteBrand)
export default route