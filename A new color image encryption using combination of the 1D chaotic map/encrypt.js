const getPixels = require('get-pixels')
const imshow = require('ndarray-imshow')
const pool = require("ndarray-scratch")
const ndarray = require("ndarray")

// secret parameters
let x0 = 0.44
let u = 2
let k = 14
let n0 = 100
let lp = 600

getPixels('../images/lena_gray_256.png', (err, pixels) => {
  if (err) throw err
  pixels = pixels.pick(null, null, 0)
  pixels = pool.clone(pixels)
  pixels.shape = [pixels.shape[0] * pixels.shape[1]]

  // permutation phase
  let x = chaoticMap(x0, u, k, pixels.shape[0], n0)
  let I = getSortIndexes(x)
  pixels.data = sortByIndexes(pixels.data, I)

  // diffusion phase
  let D = getDiffusionVector(x)
  pixels.data = diffusePixels(pixels.data, I, D)

  // rotation phase
  pixels.data = rotatePixels(pixels.data, lp)

  pixels.shape = [256, 256]
  imshow(pixels, {gray: true})
})

function chaoticMap (x0, u, k, iterations, n0) {
  let x = [x0]
  for (let i = 0; i < iterations + n0 - 1; i++) {
    let value = u * Math.sin(Math.PI * x[i]) * 2**k
    x.push(value - Math.floor(value))
  }
  return x.slice(n0)
}

function getSortIndexes (array) {
  let sortedArray = [].concat(array)
  sortedArray.sort()
  let indexes = []
  sortedArray.forEach(element => {
    let index = array.indexOf(element)
    while (indexes.includes(index)) {
      index = array.indexOf(element, index + 1)
    }
    indexes.push(index)
  })
  return indexes
}

function sortByIndexes (array, indexes) {
  let sortedArray = []
  indexes.forEach(index => {
    sortedArray.push(array[index])
  })
  return sortedArray
}

function getDiffusionVector (x) {
  let d = []
  for (let i = 0; i < x.length; i++) {
    d.push((Math.floor(x[i] * 10 ** 14)) % 256)
  }
  return d
}

function diffusePixels (pixels, permutationVector, diffusionVector) {
  console.log('diffusePixels')
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
  console.log('rotatePixels')
  for (let i = 1; i <= amount; i++) {
    let element = newArray.shift()
    newArray.push(element)
  }
  return newArray
}