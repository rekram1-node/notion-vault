import * as argon2 from 'argon2';
// import { Options } from 'argon2';

const main = async() => {
    const password = "password"
    const storedPasswordHash = "$argon2id$v=19$m=32768,t=16,p=2$c29tZSBzYWx0$FX8h3T/fe6+3bSkjzK/6C3vny645RwlHTSvGbuewnT4";
    const storedSalt = "some salt"
    
    const argon2Key = await argon2.hash(password, {
        // raw: true,
        type: 2, 
        timeCost: 16,
        memoryCost: 2 ** 15, 
        parallelism: 2, 
        // hashLength: 32,
        salt: Buffer.from("some salt")
    });
    console.log("Argon2 derive key:", argon2Key);
    
    const argon2Hash = await argon2.hash(password, {
        // raw: true,
        type: 2, 
        timeCost: 16,
        memoryCost: 2 ** 15, 
        parallelism: 2, 
        salt: Buffer.from(storedSalt),
    });
    console.log(argon2Hash === storedPasswordHash);
    // console.log("Argon2 hash (random salt):", argon2Hash);
    
    // console.log("Password 'password' correct?",
    //     await argon2.verify(argon2Hash, password));
    // console.log("Password 'wrong123' correct?",
    //     await argon2.verify(argon2Hash, "wrong123"));
}

await main();