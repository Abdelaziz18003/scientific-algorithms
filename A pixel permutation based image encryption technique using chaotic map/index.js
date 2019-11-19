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
  imread('../images/lena_gray_256.png', async (err, pixels) => {
    imshow(pixels)
    imhist(pixels)
  
    pixels = await encrypt(pixels, {times: 1})
    imhist(pixels)
    imshow(pixels)
  })
}

function decryption () {
  console.log('Not yet implemented')
}