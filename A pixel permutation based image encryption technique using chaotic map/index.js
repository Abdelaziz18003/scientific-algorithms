const fs = require('fs')
const imread = require('get-pixels')
const imshow = require('gnuplot-imshow')
const imhist = require('ndarray-imhist')
const imwrite = require('save-pixels')

const encrypt = require('./encrypt')

const plainImgURL = 'lena_gray_256.png'

if (process.argv.includes('decryption')) {
  decryption()
} else {
  encryption()
}

function encryption () {
  imread(`../images/${plainImgURL}`, async (err, pixels) => {
    imshow(pixels)
    imhist(pixels)

    pixels = await encrypt(pixels)
    imhist(pixels)
    imshow(pixels)

    imwrite(pixels, 'png')
      .pipe(fs.createWriteStream('cipher-image.png'))
  })
}

function decryption () {
  console.log('Not yet implemented')
}