/* global process */

const fs = require("fs");
const getPixels = require("get-pixels");
const savePixels = require("save-pixels");
const imshow = require("ndarray-imshow");
const pool = require("ndarray-scratch");
const imhist = require("ndarray-imhist");
const corr2 = require("ndarray-corr2");
const entropy = require("ndarray-entropy");

const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

// secret parameters
const secretKey =
  "100001001011011110111001111110000010110010101010100101010111011111000001010111101101100010001101111001000000001110110010100000010001011001111100010010100001101010000110010111000001100100111111111000001100010000010100110011011110011011110100001001111111001100110011100110011110000000100100101110000010100010111101001000000101000011010001011100110111110100011011";

if (process.argv.includes("decryption")) {
  decryption();
} else {
  encryption();
}

function encryption() {
  getPixels("../images/cameraman_gray_256.png", (err, pixels) => {
    if (err) throw err;
    pixels = pixels.pick(null, null, 0);
    let plainImage = pool.clone(pixels);
    let cipherImage = encrypt(pixels, secretKey);
    // analytics
    console.log("Correlation coeff:", corr2(cipherImage, plainImage));
    console.log("Plain image entropy:", entropy(plainImage));
    console.log("Cipher image entropy:", entropy(cipherImage));

    imhist(cipherImage);
    imhist(plainImage);

    imshow(cipherImage, { gray: true });
    imshow(plainImage, { gray: true });

    // save the encrypted image
    savePixels(cipherImage, "png").pipe(
      fs.createWriteStream("cipher-image.png")
    );
  });
}

function decryption() {
  getPixels("./cipher-image.png", (err, pixels) => {
    if (err) throw err;
    pixels = pixels.pick(null, null, 0);
    let cipherImage = pool.clone(pixels);
    let plainImage = decrypt(pixels, secretKey);

    // analytics
    console.log("Correlation coeff:", corr2(plainImage, cipherImage));
    console.log("Cipher image entropy:", entropy(cipherImage));
    console.log("Plain image entropy:", entropy(plainImage));

    imhist(plainImage);
    imhist(cipherImage);

    imshow(plainImage, { gray: true });
    imshow(cipherImage, { gray: true });

    // save the encrypted image
    savePixels(plainImage, "png").pipe(fs.createWriteStream("plain-image.png"));
  });
}
