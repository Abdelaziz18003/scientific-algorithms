const pool = require("ndarray-scratch")
const {getSortIndexes, sortByIndexes} = require('../utils/array')

function encrypt (pixels, options) {
  let {x0, u, k, n0, lp} = options
  let cipherImage = pool.clone(pixels)
  
  // permutation phase
  console.time('permutation')
  cipherImage.shape = [cipherImage.shape[0] * cipherImage.shape[1]]
  let x = chaoticMap(x0, u, k, cipherImage.shape[0], n0)
  let I = getSortIndexes(x)
  cipherImage.data = sortByIndexes(cipherImage.data, I)
  console.timeEnd('permutation')
  
  // diffusion phase
  console.time('diffusion')
  let D = getDiffusionVector(x)
  cipherImage.data = diffusePixels(cipherImage.data, I, D)
  console.timeEnd('diffusion')
  
  // rotation phase
  console.time('rotation')
  cipherImage.data = rotatePixels(cipherImage.data, lp)
  console.timeEnd('rotation')

  cipherImage.shape = [256, 256]
  return cipherImage
}

function chaoticMap (x0, u, k, iterations, n0) {
  let x = [x0]
  for (let i = 0; i < iterations + n0 - 1; i++) {
    let value = u * Math.sin(Math.PI * x[i]) * 2**k
    x.push(value - Math.floor(value))
  }
  return x.slice(n0)
}

function getDiffusionVector (x) {
  let d = []
  for (let i = 0; i < x.length; i++) {
    d.push((Math.floor(x[i] * 10 ** 14)) % 256)
  }
  return d
}

function diffusePixels (pixels, permutationVector, diffusionVector) {
  let newPixels = []
  newPixels[0] = pixels[0]
  for (let i = 1; i < pixels.length; i++) {
    let value = ((permutationVector[i] + diffusionVector[i]) % 256) ^ newPixels[i-1]
    newPixels.push(value)
  }
  return newPixels
}

function rotatePixels (array, amount) {
  let newArray = [].concat(array)
  for (let i = 1; i <= amount; i++) {
    let element = newArray.shift()
    newArray.push(element)
  }
  return newArray
}

module.exports = encrypt