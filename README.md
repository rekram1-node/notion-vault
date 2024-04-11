# notion-vault

Notion Vault is (going to be) a free open source integration for Notion that allows someone to have end to end encrypted
text content embedded in their Notion pages.

# Encryption

* Encryption follows (owasp cheat sheet recommendations)[https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#introduction]
* We use argon2id for key derivation from a password that is used to encrypt content using AES-256-CBC.

# Development/Running things

Notion Vault uses clerk as the authentication provider with Notion being the 
only allowed social connection.



Update personal notion secret if possible...

