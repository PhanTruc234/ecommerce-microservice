import { prisma } from "../configs/prisma"
import { generateKeyPair } from "../utils/crypto"




export const createApiKey = async (userId: string) => {
    const { publicKey, privateKey } = generateKeyPair()
    return prisma.apiKey.create({
        data: {
            userId,
            publicKey,
            privateKey,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
    })
}

