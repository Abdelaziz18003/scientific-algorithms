const http = require("http");
const getPixels = require("get-pixels");
const savePixels = require("save-pixels");

// const encrypt = require("./encrypt");
const decrypt = require("./decrypt");

const cipherImagePath = "./cipher-image.png";

// secret parameters
const secretKey =
  "100001001011011110111001111110000010110010101010100101010111011111000001010111101101100010001101111001000000001110110010100000010001011001111100010010100001101010000110010111000001100100111111111000001100010000010100110011011110011011110100001001111111001100110011100110011110000000100100101110000010100010111101001000000101000011010001011100110111110100011011";

const server = http.createServer(async (req, res) => {
  getPixels(cipherImagePath, (err, pixels) => {
    if (err) throw err;
    pixels = pixels.pick(null, null, 0);
    let plainImage = decrypt(pixels, secretKey);

    // save the encrypted image
    savePixels(plainImage, "png")
      .pipe(res)
      .on("end", () => {
        res.setHeader("Content-Type", "image/png");
        res.end();
      });
  });
});

server.listen(3000, () => {
  console.log("visit http://localhost:3000");
});
