const getPixels = require('get-pixels')
// const imshow = require('ndarray-imshow')
const imshow = require('gnuplot-imshow')
const imhist = require('ndarray-imhist')

const encrypt = require('./encrypt')

getPixels('../images/lena_gray_128.png', (err, pixels) => {
  imshow(pixels)
  imhist(pixels)
  pixels = encrypt(pixels)
  imhist(pixels)
  imshow(pixels, {gray: true})
})