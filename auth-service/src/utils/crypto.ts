import crypto from "crypto"
export const generateKeyPair = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
    })
    const privateKeyString = privateKey.export({
        type: "pkcs8",
        format: "pem"
    })
    const publicKeyString = publicKey.export({
        type: "spki",
        format: "pem"
    })
    return {
        publicKey: publicKeyString,
        privateKey: privateKeyString
    }
}

