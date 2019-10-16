const fs = require('fs')
const getPixels = require('get-pixels')
const savePixels = require('save-pixels')
const imshow = require('ndarray-imshow')
const pool = require("ndarray-scratch")
const imhist = require('ndarray-imhist')
const corr2 = require('ndarray-corr2')
const entropy = require('ndarray-entropy')

const encrypt = require('./encrypt')

// secret parameters
const secretKey = {
  x0: 0.456,
  u: 5.4321,
  k: 14,
  n0: 1000,
  lp: 600
}

getPixels('../images/lena_gray_256.png', (err, pixels) => {
  if (err) throw err
  pixels = pixels.pick(null, null, 0)
  let plainImage = pool.clone(pixels)
  let cipherImage = encrypt(pixels, secretKey)
  
  // analytics
  console.log('Correlation coeff:', corr2(cipherImage, plainImage))
  console.log('Plain image entropy:', entropy(plainImage))
  console.log('Cipher image entropy:', entropy(cipherImage))

  imhist(cipherImage)
  imhist(plainImage)

  imshow(cipherImage, {gray: true})
  imshow(plainImage, {gray: true})

  // save the encrypted image
  savePixels(cipherImage, 'png').pipe(fs.createWriteStream('cipher-image.png'))
})