import { prisma } from "../configs/prisma";
import hemera from "../configs/hemera"

hemera.add(
    {
        topic: "auth",
        cmd: "getPublicKey",
    },
    async (req) => {
        const kid = req.kid as string;


        const apiKey = await prisma.apiKey.findUnique({
            where: { id: kid },
            select: { publicKey: true },
        });


        if (!apiKey) {
            throw new Error("ApiKey not found");
        }


        return {
            publicKey: apiKey.publicKey,
        };
    }
);

