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
            console.log(`[HEARTBEAT] không thể kết nối với dịch vụ quan sát`);
        }
    }, 10000);
};