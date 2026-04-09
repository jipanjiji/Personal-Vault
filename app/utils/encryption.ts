import CryptoJS from "crypto-js";

/**
 * Encrypts a string using a key.
 * Used for storing passwords in Firestore.
 */
export const encryptContent = (text: string, key: string): string => {
  if (!text || !key) return "";
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Decrypts a string using a key.
 * Used for viewing passwords in the dashboard.
 */
export const decryptContent = (ciphertext: string, key: string): string => {
  if (!ciphertext || !key) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error: Unable to decrypt";
  }
};
