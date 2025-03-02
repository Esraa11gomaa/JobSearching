import CryptoJS from "crypto-js"

export const generateEncryption =({plainText = "", signature = process.env.ENCRYPTION_SIGNATURE} = {} )=>{
   if (!signature) {
      throw new Error("Missing ENCRYPTION_SIGNATURE in environment variables");
  }
  console.log("Encrypting:", plainText);

   return CryptoJS.AES.encrypt(plainText, signature).toString()

}

export const generateDecryption =({cipherText = "", signature = process.env.ENCRYPTION_SIGNATURE} = {} )=>{
   return CryptoJS.AES.decrypt(cipherText, signature).toString(CryptoJS.enc.Utf8)

}