import hemera from "../configs/hemera";

const HEARTBEAT_INTERVAL_MS = Number(process.env.HEARTBEAT_INTERVAL_MS || 10000);

export const startHeartbeat = (service: string) => {
    const sendHeartbeat = async () => {
        try {
            await hemera.act({
                topic: "observability",
                cmd: "heartbeat",
                service,
                timestamp: Date.now(),
            });
        } catch {
            console.log("[HEARTBEAT] cannot connect to observability-service");
        }
    };

    void sendHeartbeat();
    setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
};
