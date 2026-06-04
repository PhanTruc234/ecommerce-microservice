import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";
import paymentRoute from "./routes/payment.route";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { startHeartbeat } from "./observability/heartbeat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(helmet());
app.use(requestLogger("payment-service"));
app.use("/api/payment", paymentRoute);
startHeartbeat("payment-service");
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});
