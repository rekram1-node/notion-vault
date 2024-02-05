import { version } from 'react';
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';

const algorithm = 'aes-256-cbc';
const salt = randomBytes(16); // Salts should be unique per user
const iv = randomBytes(16); // Initialization vector for AES-CBC
console.log(version);
// Function to derive encryption key from password
function deriveKey(password: string, salt: Buffer, keyLength = 32) {
    return pbkdf2Sync(password, salt, 100000, keyLength, 'sha256');
}

// Encrypt function
function encrypt(text: string, password: string): { iv: string; encryptedData: string; salt: string } {
    const key = deriveKey(password, salt);
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        salt: salt.toString('hex')
    };
}

// Decrypt function
function decrypt(encryptedData: string, iv: string, salt: string, password: string): string {
    const key = deriveKey(password, Buffer.from(salt, 'hex'));
    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Usage
const password = 'your-secure-password'; // This should be provided by the user
const originalText = 'This is the secret message!';
const encrypted = encrypt(originalText, password);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted.encryptedData, encrypted.iv, encrypted.salt, password);
console.log('Decrypted:', decrypted);
