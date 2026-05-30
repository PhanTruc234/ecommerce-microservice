

import { prisma } from "../configs/prisma"
import { Unauthorized } from "../errors/http.error"
import jwt from "jsonwebtoken"
export const createAccessToken = async (payload: { id: string, role?: string }) => {
    const apiKey = await prisma.apiKey.findFirst({
        where: {
            userId: payload.id.toString()
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    if (!apiKey?.privateKey) {
        throw new Unauthorized("Private key not found")
    }
    return jwt.sign(payload, apiKey.privateKey, {
        algorithm: "RS256",
        expiresIn: "15m",
        keyid: apiKey.id
    })
}
export const createRefreshToken = async (payload: { id: string }) => {
    const apiKey = await prisma.apiKey.findFirst({
        where: {
            userId: payload.id.toString()
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    if (!apiKey?.privateKey) {
        throw new Unauthorized("Private key not found")
    }
    return jwt.sign(payload, apiKey.privateKey, {
        algorithm: "RS256",
        expiresIn: "30m",
        keyid: apiKey.id
    })
}

