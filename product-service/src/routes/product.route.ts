import express from "express";
import fs from 'fs';
import path from "path";
import multer from 'multer';
import productController from "../controllers/product.controller";
import { authUser, checkRole } from "../middlewares/auth.middleware";
import { addAttributeSchema, addVariantSchema, createProductSchema, updateAttributeSchema, updateProductSchema, updateVariantSchema } from "../schemas/product.schema";
import { validate } from "../middlewares/validate.middleware";
const route = express.Router();
const uploadPath = path.join(process.cwd(), "uploads/products");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
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
route.get("/", productController.getProducts)

route.get("/:id", productController.getProductById)
route.post("/", authUser, checkRole("ADMIN"), validate(createProductSchema, "body"), productController.addProduct)
route.post("/upload", authUser, checkRole("ADMIN"), upload.array("products", 10), productController.uploadImgTem)
route.post("/:id/variants", authUser, checkRole("ADMIN"), validate(addVariantSchema, "body"), productController.addVariant)

route.post("/:id/variants/:variantId", authUser, checkRole("ADMIN"), validate(addVariantSchema, "body"), productController.updateVariant)

route.patch("/:id/variants/:variantId", authUser, checkRole("ADMIN"), validate(updateVariantSchema, "body"), productController.updateVariant)

route.post("/:id/variants/:variantId/attributes", authUser, checkRole("ADMIN"), validate(addAttributeSchema, "body"), productController.addAttribute)

route.patch("/:id/variants/:variantId/attributes/:attributeId", authUser, checkRole("ADMIN"), validate(updateAttributeSchema, "body"), productController.updateAttribute)

route.patch("/:id", authUser, checkRole("ADMIN"), validate(updateProductSchema, "body"), productController.updateProduct)

route.delete("/tem", authUser, checkRole("ADMIN"), productController.deleteImgTem)

route.delete("/:id", authUser, checkRole("ADMIN"), productController.deleteProduct)

route.delete("/:id/variants/:variantId", authUser, checkRole("ADMIN"), productController.deleteVariant)

route.delete("/:id/variants/:variantId/attributes/:attributeId", authUser, checkRole("ADMIN"), productController.deleteAttribute)

export default route
