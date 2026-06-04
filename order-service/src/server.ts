import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import { errorHandler } from './middlewares/error.middleware';
import cartRoute from "./routes/cart.route"
import orderRoute from "./routes/order.route"
import "./actions/order.hemera"
import { requestLogger } from './middlewares/requestLogger.middleware';
import { startHeartbeat } from './observability/heartbeat';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(helmet());
app.use(requestLogger("order-service"));
app.use("/api/carts", cartRoute)
app.use("/api/orders", orderRoute)
startHeartbeat("order-service");
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);
});
