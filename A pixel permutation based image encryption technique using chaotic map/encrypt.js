const ndarray = require('ndarray')
const pool = require('ndarray-scratch')

const defaultOptions = {
  epsilon: 1,
  phi: 1,
  times: 1
}

function encrypt(pixels, options) {
  options = Object.assign({}, defaultOptions, options)
  pixels = pool.clone(pixels.pick(null, null, 0))

  pixels = permutePixels(pixels, options)
  // pixels = diffusePixels(pixels, R)

  return pixels
}

function permutePixels(pixels, options) {
  const { epsilon, phi, times } = options
  const [m, n] = pixels.shape
  let original = pool.clone(pixels)
  let permuted = pool.clone(pixels)
  let [u, v] = [0, 0]

  for (let k = 0; k < times; k++) {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        u = ((i + epsilon * j) % m)
        v = ((phi * i + (epsilon * phi + 1) * j) % m)
        permuted.set(i, j, original.get(u, v))
      }
    }
    original = pool.clone(permuted)
  }
  return permuted
}

function diffusePixels(pixels, R) {
  // 
}

module.exports = encrypt
