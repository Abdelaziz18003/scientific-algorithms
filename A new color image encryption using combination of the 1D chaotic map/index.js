const fs = require('fs')
const getPixels = require('get-pixels')
const savePixels = require('save-pixels')
const imshow = require('ndarray-imshow')
const pool = require("ndarray-scratch")
const imhist = require('ndarray-imhist')
const corr2 = require('ndarray-corr2')
const entropy = require('ndarray-entropy')

const encrypt = require('./encrypt')
const decrypt = require('./decrypt')

// secret parameters
const secretKey = {
  x0: 0.456,
  u: 5.4321,
  k: 14,
  n0: 1000,
  lp: 600
}

if (process.argv.includes('decryption')) {
  decryption()
} else {
  encryption()
}

function encryption () {
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
}

function decryption () {
  getPixels('./cipher-image.png', (err, pixels) => {
    if (err) throw err
    pixels = pixels.pick(null, null, 0)
    let cipherImage = pool.clone(pixels)
    let plainImage = decrypt(pixels, secretKey)
    
    // analytics
    console.log('Correlation coeff:', corr2(plainImage, cipherImage))
    console.log('Cipher image entropy:', entropy(cipherImage))
    console.log('Plain image entropy:', entropy(plainImage))
  
    imhist(plainImage)
    imhist(cipherImage)
  
    imshow(plainImage, {gray: true})
    imshow(cipherImage, {gray: true})
  
    // save the encrypted image
    savePixels(plainImage, 'png').pipe(fs.createWriteStream('plain-image.png'))
  })
}