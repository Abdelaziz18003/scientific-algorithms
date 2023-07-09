const crypto = require("crypto");
const { Buffer } = require("buffer");

function decrypt(data, key) {
  const iv = Buffer.from(data).subarray(0, 16);
  const encrypted = Buffer.from(data).subarray(16, data.length - 16);
  const authTag = Buffer.from(data).subarray(data.length - 16, data.length);
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = decrypt;
