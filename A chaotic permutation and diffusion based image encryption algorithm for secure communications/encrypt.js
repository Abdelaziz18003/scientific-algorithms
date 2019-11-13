const ndarray = require('ndarray')
const pool = require('ndarray-scratch')

const x0 = 0.223456
const y0 = 0.856823
const alpha = 0.2

function encrypt (pixels, options = {}) {
  pixels = pool.clone(pixels.pick(null, null, 0))
  let [m, n] = pixels.shape
  let [X, Y] = bakerMap(pixels.size, alpha, x0, y0)

  X = normalizeVector(X, m)
  Y = normalizeVector(Y, n)

  pixels = swapPixels(pixels, X, Y)

  let R = generateRandomNumber(alpha, x0, y0)
  pixels = diffusePixels(pixels, R)

  return pixels
}

// This is a fake bakerMap. The paper's map gave bad results
function bakerMap (size, alpha, x0, y0) {
  let X = [x0]
  let Y = [y0]
  alpha = alpha * 0.01 + 3.98
  for (let i = 0; i < size; i++) {
    X[i+1] = alpha * X[i] * (1 - X[i])
    Y[i+1] = alpha * Y[i] * (1 - Y[i])
  }
  return [X, Y]
}

function normalizeVector (vector, max) {
  return vector.map(value => {
    return Math.floor(value * max)
  })
}

function swapPixels (pixels, X, Y) {
  let currentValue = 0
  for (let i = 0; i < pixels.shape[0]; i++) {
    for (let j = 0; j < pixels.shape[1]; j++) {
      currentValue = pixels.get(i, j)
      pixels.set(i, j, pixels.get(X[i], Y[j]))
      pixels.set(X[i], Y[j], currentValue)
    }
  }
  return pixels
}

function generateRandomNumber (alpha, x0, y0) {
  // The random number is hardcoded because it was not described in the paper how to generate it
  return 57
}

function diffusePixels (pixels, R) {
  let r = 0
  let c = 0
  let p = 0
  let [m, n] = pixels.shape
  let cipher = pool.zeros([m, n])

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      p = pixels.get(i, j)
      if (i == 0 || j == 0) {
        r = R % 256
      } else {
        r = (pixels.get(i-1, j-1) + R) % 256
      }
      c = (r ^ p ^ (m/(i + 1) + n/(j + 1)) % 256)
      cipher.set(i, j, c)
    }
  }
  return cipher
}

module.exports = encrypt
