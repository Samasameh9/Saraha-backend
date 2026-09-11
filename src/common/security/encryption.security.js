import crypto from "node:crypto";
import { ENC_KEY, IV_LENGTH } from "../../config.js";

export const encryption = async (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher =  crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv);
  let encryptedData = cipher.update(plaintext, "utf-8", "hex")
  encryptedData += cipher.final("hex");
  console.log({cipher,encryptedData});
  
  return `${iv.toString("hex")}::${encryptedData}`;
};

export const decryption=async(ciphertext)=>{
const [iv,encryptedData]=ciphertext.split("::")
const iv_vector=Buffer.from(iv,"hex")
const decryptedVector=crypto.createDecipheriv("aes-256-cbc",ENC_KEY,iv_vector)
let plaintext=decryptedVector.update(encryptedData,"hex","utf-8")
plaintext+=decryptedVector.final("utf-8")
return plaintext
}