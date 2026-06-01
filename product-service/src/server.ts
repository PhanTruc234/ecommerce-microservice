import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import { errorHandler } from './middlewares/error.middleware';
import brandRoute from "./routes/brand.route"
import categoryRoute from "./routes/category.route"
import productRoute from "./routes/product.route"
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(helmet());
app.use('/api/brands', brandRoute)
app.use("/api/categories", categoryRoute)
app.use("/api/products", productRoute)
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);
});