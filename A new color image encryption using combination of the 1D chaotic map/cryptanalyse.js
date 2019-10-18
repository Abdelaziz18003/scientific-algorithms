const ndarray = require('ndarray')
const pool = require('ndarray-scratch')
const imshow = require('ndarray-imshow')
const imhist = require('ndarray-imhist')
const getPixels = require('get-pixels')

const encrypt = require('./encrypt')
const {sortByIndexes} = require('../utils/array')

getPixels('./cipher-image.png', (err, pixels) => {
  pixels = pool.clone(pixels.pick(null, null, 0))

  // reverse diffusion 
  let diffusionVector = getDiffusionVector(pixels)
  pixels = reverseDiffusePixels(pixels, diffusionVector)
  imhist(pixels)
  
  // reverse permutation
  let permutationVector = getPermutationVector(pixels, diffusionVector)
  pixels.data = sortByIndexes(pixels.data, permutationVector)

  // result display
  imhist(pixels)
  imshow(pixels, {gray: true})
})


function getDiffusionVector(cipherImage) {
  const zerosPlainImage = pool.zeros(cipherImage.shape)
  const zerosCipherImage = encrypt(zerosPlainImage)
  let d = [0]
  for (let i = 1; i < zerosCipherImage.data.length; i++) {
    d.push((zerosCipherImage.data[i] ^ zerosCipherImage.data[i - 1]) % 256)
  }
  return d
}

function reverseDiffusePixels (cipherImage, diffusionVector) {
  let permutedData = new Uint8Array(cipherImage.size)
  let cipherData = cipherImage.data
  permutedData[0] = cipherData[0]
  for (let i = 1; i < cipherData.length; i++) {
    permutedData[i] = ((cipherData[i] ^ cipherData[i-1]) - diffusionVector[i]) % 256
  }
  return ndarray(permutedData, cipherImage.shape)
}

function getPermutationVector (cipherImage, diffusionVector) {
  let permutationVector = []
  for (let j = 0; j < cipherImage.data.length; j++) {
    let plain = pool.zeros(cipherImage.shape)
    plain.data[j] = 255
    let cipher = encrypt(plain)
    let permuted = reverseDiffusePixels(cipher, diffusionVector)
    permutationVector[j] = permuted.data.indexOf(255)
  }
  return permutationVector
}
