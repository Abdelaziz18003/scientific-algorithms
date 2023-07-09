const http = require("http");
const crypto = require("crypto");
const fs = require("fs/promises");
const { Buffer } = require("buffer");

// const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

// secret parameters
const password = "abcd1234";
const salt = Buffer.from([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]);
const secretKey = crypto.scryptSync(password, salt, 32);

const server = http.createServer(async (req, res) => {
  const encryptedImage = await fs.readFile("./encrypted");
  const decrytpedImage = decrypt(encryptedImage, secretKey);
  res.setHeader("Content-Type", "image/png");
  res.end(decrytpedImage);
});

server.listen(3000, () => {
  console.log("visit http://localhost:3000");
});
