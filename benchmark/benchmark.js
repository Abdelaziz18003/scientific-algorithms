/* global __dirname */

const fs = require("fs");
const imread = require("get-pixels");
const imwrite = require("save-pixels");
const { Buffer } = require("buffer");
const crypto = require("crypto");
const path = require("path");

// AES secret key
const password = "abcd1234";
const salt = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const aesSecretKey = crypto.scryptSync(password, salt, 32);

// Fast Bulban secret key
const fastBulanSecretKey =
  "100001001011011110111001111110000010110010101010100101010111011111000001010111101101100010001101111001000000001110110010100000010001011001111100010010100001101010000110010111000001100100111111111000001100010000010100110011011110011011110100001001111111001100110011100110011110000000100100101110000010100010111101001000000101000011010001011100110111110100011011";

const fastBulbanEncrypt = require("../Fast image encryption algorithm with high security level using the Bülban chaotic map/encrypt");
const aesEncrypt = require("../aes_gcm_256/encrypt");

const fastBulbanDecrypt = require("../Fast image encryption algorithm with high security level using the Bülban chaotic map/decrypt");
const aesDecrypt = require("../aes_gcm_256/decrypt");

const fastBulbanPlain = "../images/cameraman_gray_256.png";
const fastBulbanCipher = "./fast_bulban_cipher.png";
const aesPlainImage = "../images/cameraman_gray_256.png";
const aesCipherImage = path.join(__dirname, "./aes_cipher");

const testImages = [
  {
    id: "gray-256",
    url: path.join(__dirname, "../images/cameraman_gray_256.png"),
    color: false,
  },
  {
    id: "rgb-256",
    url: path.join(__dirname, "../images/baboon_rgb_256.jpg"),
    color: true,
  },
];

const repetitions = 10;
run();

async function run() {
  for (let img of testImages) {
    await benchmark(img);
  }
}

async function benchmark(img) {
  // benchmark Fast Bulban Encrypt
  console.time(`Bulban Fast Encrypt ${img.id}`);
  await benchmarkFastBulbanEncrypt(img);
  console.timeEnd(`Bulban Fast Encrypt ${img.id}`);

  // benchmark Fast Bulban Decrypt
  console.time(`Bulban Fast Decrypt ${img.id}`);
  await benchmarkFastBulbanDecrypt(img);
  console.timeEnd(`Bulban Fast Decrypt ${img.id}`);

  // benchmark AES_GCM_256 Encrypt
  console.time(`AES Encrypt ${img.id}`);
  benchmarkAesEncrypt(img);
  console.timeEnd(`AES Encrypt ${img.id}`);

  // benchmark AES_GCM_256 Decrypt
  console.time(`AES Decrypt ${img.id}`);
  benchmarkAesDecrypt();
  console.timeEnd(`AES Decrypt ${img.id}`);

  console.log("\n\n");
}

function benchmarkAesEncrypt(img) {
  for (let i = 0; i <= repetitions; i++) {
    const plainImage = fs.readFileSync(img.url);
    const encryptedImage = aesEncrypt(plainImage, aesSecretKey);
    fs.writeFileSync(aesCipherImage, encryptedImage);
  }
}
function benchmarkAesDecrypt() {
  for (let i = 0; i <= repetitions; i++) {
    const encryptedImage = fs.readFileSync(aesCipherImage);
    const decrytpedImage = aesDecrypt(encryptedImage, aesSecretKey);
    fs.writeFileSync("aes_decrypted.png", decrytpedImage);
  }
}
function benchmarkFastBulbanEncrypt(img) {
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i <= repetitions; i++) {
        imread(img.url, (err, pixels) => {
          const plain = img.color ? pixels : pixels.pick(null, null, 1);
          const encrypted = fastBulbanEncrypt(plain, fastBulanSecretKey);
          let writeStream = fs
            .createWriteStream(fastBulbanCipher)
            .on("finish", () => {
              if (i == repetitions) {
                resolve(true);
              }
            });
          imwrite(encrypted, "png").pipe(writeStream);
        });
      }
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
async function benchmarkFastBulbanDecrypt(img) {
  for (let i = 0; i <= repetitions; i++) {
    const pixels = await imreadAsync(`${fastBulbanCipher}`);
    const plain = img.color ? pixels : pixels.pick(null, null, 1);
    const decrypted = fastBulbanDecrypt(plain, fastBulanSecretKey);
    imwrite(decrypted, "png").pipe(
      fs.createWriteStream("fast_bulban_decrypted.png")
    );
  }
}

function imreadAsync(path) {
  return new Promise((resolve, reject) => {
    imread(path, (err, pixels) => {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    });
  });
}
