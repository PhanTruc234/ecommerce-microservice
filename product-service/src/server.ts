import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import "./actions/product.hemera";
import { errorHandler } from './middlewares/error.middleware';
import brandRoute from "./routes/brand.route"
import categoryRoute from "./routes/category.route"
import productRoute from "./routes/product.route"
import { requestLogger } from './middlewares/requestLogger.middleware';
import { startHeartbeat } from './observability/heartbeat';
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
app.use(requestLogger("product-service"));
app.use('/api/brands', brandRoute)
app.use("/api/categories", categoryRoute)
app.use("/api/products", productRoute)
startHeartbeat("product-service");
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Product Service running on port ${PORT}`);
});