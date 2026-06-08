import hemera from "../configs/hemera";

export const startHeartbeat = (service: string) => {
    setInterval(async () => {
        try {
            await hemera.act({
                topic: "observability",
                cmd: "heartbeat",
                service,
                timestamp: Date.now(),
            });
        } catch {
            console.log(`[HEARTBEAT] cannot reach observability-service`);
        }
    }, 5000);
};