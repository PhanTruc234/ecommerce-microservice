import Hemera from "nats-hemera";
import nats from "nats";

const NATS_URL = process.env.NATS_URL || "nats://localhost:4222";

const nc = nats.connect({
    servers: [NATS_URL],
});

const hemera = new Hemera(nc, {
    name: "observability-service",
} as any);

export default hemera;
