# notion-vault

Notion Vault is (going to be) a free open source integration for Notion that allows someone to have end to end encrypted
text content embedded in their Notion pages.

## Encryption

* We use argon2id for key derivation from your password 
* The argon2id derived key is used in combination with AES-256-CBC to encrypt your content
* Password Encryption follows (owasp cheat sheet recommendations)[https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#introduction]
* The encrypted pages/documents follow owasp recommendations for (insecure direct object reference prevention)[https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html]

## Contributing

See Contributing.md


