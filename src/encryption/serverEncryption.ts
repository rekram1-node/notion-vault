import argon2 from "argon2";

export const hashPassword = async(password: string, salt: Buffer | string) => {
    const saltBuffer = typeof salt === 'string' ? Buffer.from(salt, 'base64') : salt;
    const hashedPassword = await argon2.hash(password, {
        type: 2,
        salt: saltBuffer,
        timeCost: 2,
        memoryCost: 2 ** 17,
        hashLength: 32,
        parallelism: 1,
    })

    return hashedPassword
}