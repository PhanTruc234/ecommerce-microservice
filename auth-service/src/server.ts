import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import "./actions/auth.hemera";
import authRoute from "./routes/auth.route"
import { errorHandler } from './middlewares/error.middleware';
import { startHeartbeat } from './observability/heartbeat';
import { requestLogger } from './middlewares/requestLogger.middleware';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(helmet());
app.use(requestLogger("auth-service"));
app.use("/api/auths", authRoute)
startHeartbeat("auth-service");
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 Auth Service running on port ${PORT}`);
});