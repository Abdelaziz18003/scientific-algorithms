const fs = require('fs')
const imread = require('get-pixels')
// const imshow = require('ndarray-imshow')
const imshow = require('gnuplot-imshow')
const imhist = require('ndarray-imhist')
const imwrite = require('save-pixels')

const encrypt = require('./encrypt')

if (process.argv.includes('decryption')) {
  decryption()
} else {
  encryption()
}

function encryption () {
  imread('../images/lena_gray_64.png', (err, pixels) => {
    imshow(pixels)
    imhist(pixels)
  
    pixels = encrypt(pixels)
    imhist(pixels)
  
    imshow(pixels, {gray: true})
    imwrite(pixels, 'png')
      .pipe(fs.createWriteStream('cipher-image.png'))
  })
}

function decryption () {
  console.log('Not yet implemented')
}