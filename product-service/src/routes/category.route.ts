import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import categoryController from "../controllers/category.controller";
import { authUser, checkRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { categoryParamsSchema, createCategorySchema, updateCategorySchema } from "../schemas/category.schema";


const route = express.Router()
const uploadPath = path.join(process.cwd(), "uploads/categories");
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
route.get("/list", categoryController.getListCategories)
route.get("/tree", categoryController.getCategoriesLevel1andLevel2)
route.get("/tree/all", categoryController.getCategoriesAll)
route.post("/", authUser, checkRole("ADMIN"), validate(createCategorySchema, "body"), categoryController.addCategory)
route.post("/upload", authUser, checkRole("ADMIN"), upload.single("category-img"), categoryController.uploadImgCategory)
route.patch("/:id", authUser, checkRole("ADMIN"), validate(categoryParamsSchema, "params"), validate(updateCategorySchema, "body"), categoryController.updateCategory)
route.delete("/:id", authUser, checkRole("ADMIN"), validate(categoryParamsSchema, "params"), categoryController.deleteCategory)
export default route