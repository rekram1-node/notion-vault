/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// import * as argon2 from 'argon2';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
// const argon2 = require("argon2-browser");


export const createSalt = () => {
    return randomBytes(16);
}

// Probably not a bad idea to use username + password
// export const deriveKeyFromPassword = async(password: string, salt: Buffer ) => {
//     argon2.hash({
//         pass: password,
//         salt: salt,
//         time: 2,
//         mem: 2 ** 17,
//         parallelism: 1,
//         hashLen: 32,
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         type: argon2.ArgonType.Argon2id,    
//     })
//     // const derivedKey = await argon2.hash(password, { 
//     //     type: 2,              // Argon2id
//     //     memoryCost: 2 ** 17,  // Matches OWASP minimum recommendation of 19 MiB
//     //     timeCost: 2,          // Matches OWASP recommendation
//     //     parallelism: 1,       // Matches OWASP recommendation
//     //     hashLength: 32,       // AES-256 requires a 32-byte key
//     //     raw: true,            // AES-256 needs this in Buffer format
//     //     salt: salt,
//     // });
//     // return derivedKey;
// }

export const encryptData = async(data: string, iv: Buffer, key: Buffer) => {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export const decryptData = async(encryptedData: string, iv: Buffer, key: Buffer) => {
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
