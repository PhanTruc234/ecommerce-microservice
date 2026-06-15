import "dotenv/config";
import express from "express";
import cors from "cors";
import hemera from "./configs/hemera";
import { renderDashboard } from "./utils/renderDashboard";

type HeartbeatState = {
    service: string;
    status: "UP" | "DOWN";
    lastSeen: number;
};

type RequestLog = {
    requestId: string;
    service: string;
    method?: string;
    path?: string;
    statusCode?: number;
    durationMs?: number;
    message?: string;
    timestamp: number;
};

const app = express();
const PORT = process.env.PORT || 3010;
const HEARTBEAT_TIMEOUT_MS = Number(process.env.HEARTBEAT_TIMEOUT_MS || 30000);
const HEARTBEAT_SWEEP_MS = Number(process.env.HEARTBEAT_SWEEP_MS || 10000);
const MAX_LOGS = Number(process.env.MAX_OBSERVABILITY_LOGS || 100);

const services = new Map<string, HeartbeatState>();
const logs: RequestLog[] = [];

const getServicesSnapshot = () =>
    Array.from(services.values()).map((service) => ({
        ...service,
        lastSeenAgoMs: Date.now() - service.lastSeen,
    }));

hemera.add(
    {
        topic: "observability",
        cmd: "heartbeat",
    },
    async (req: any) => {
        const serviceName =
            typeof req.service === "string" ? req.service.trim() : "";

        if (!serviceName) {
            return { ok: false, message: "Missing service name" };
        }

        const previous = services.get(serviceName);

        services.set(serviceName, {
            service: serviceName,
            status: "UP",
            lastSeen: Date.now(),
        });

        if (!previous) {
            console.log(`[HEARTBEAT] ${serviceName} is up`);
        }

        if (previous?.status === "DOWN") {
            console.log(`[HEARTBEAT] ${serviceName} recovered`);
        }

        return { ok: true };
    }
);

hemera.add(
    {
        topic: "observability",
        cmd: "log",
    },
    async (req: any) => {
        const log: RequestLog = {
            requestId: req.requestId || "-",
            service: req.service || "unknown-service",
            method: req.method,
            path: req.path,
            statusCode: req.statusCode,
            durationMs: req.durationMs,
            message: req.message,
            timestamp: req.timestamp || Date.now(),
        };

        logs.unshift(log);
        logs.splice(MAX_LOGS);

        console.log(
            `[LOG] requestId=${log.requestId} service=${log.service} method=${log.method || "-"} path=${log.path || "-"} status=${log.statusCode || "-"} duration=${log.durationMs || "-"}ms`
        );

        return { ok: true };
    }
);

setInterval(() => {
    const now = Date.now();

    for (const [service, state] of services.entries()) {
        const isDown = now - state.lastSeen > HEARTBEAT_TIMEOUT_MS;

        if (isDown && state.status !== "DOWN") {
            services.set(service, {
                ...state,
                status: "DOWN",
            });

            console.log(`[HEARTBEAT] ${service} is down`);
        }
    }
}, HEARTBEAT_SWEEP_MS);

app.use(cors());

app.get("/", (req, res) => {
    res.type("html").send(renderDashboard());
});

app.get(["/services", "/api/services"], (req, res) => {
    res.json({
        services: getServicesSnapshot(),
    });
});

app.get(["/logs", "/api/logs"], (req, res) => {
    res.json({
        logs,
    });
});

app.listen(PORT, () => {
    console.log(`Observability dashboard is running on port ${PORT}`);
});

console.log("Observability service started");
