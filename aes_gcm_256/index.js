/* global process */

const crypto = require("crypto");
const fs = require("fs");
const { Buffer } = require("buffer");

const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

// secret parameters
const password = "abcd1234";
const salt = Buffer.from([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]);
const secretKey = crypto.scryptSync(password, salt, 32);
console.log(secretKey, secretKey.length);

console.log("derived key", crypto.scryptSync(password, salt, 32));

if (process.argv.includes("decryption")) {
  const encryptedImageData = fs.readFileSync("./encrypted");
  decryption(encryptedImageData);
} else {
  const plainImageData = fs.readFileSync("../images/cameraman_gray_256.png");
  encryption(plainImageData);
}

function encryption(data) {
  const encrypted = encrypt(data, secretKey);
  fs.writeFileSync("./encrypted", encrypted);
}

function decryption(data) {
  const decrypted = decrypt(data, secretKey);
  if (decrypted) {
    fs.writeFileSync("./decrypted.png", decrypted);
  }
}
