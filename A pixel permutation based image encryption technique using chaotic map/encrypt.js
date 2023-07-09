const util = require('util');
const pool = require('ndarray-scratch');
const ops = require('ndarray-ops');
const imread = util.promisify(require('get-pixels'));

const defaultOptions = {
  epsilon: 1,
  phi: 1,
  times: 3,
  rgbChannel: 2, // which channel of RefImg to mask the encrypted image in
  refImgURL: 'baboon_rgb_256.jpg'
};

async function encrypt(pixels, options) {
  options = Object.assign({}, defaultOptions, options);
  pixels = pool.clone(pixels.pick(null, null, 0));

  pixels = permutePixels(pixels, options);
  pixels = await diffusePixels(pixels, options);

  return pixels;
}

function permutePixels(pixels, options) {
  const { epsilon, phi, times } = options;
  const [m, n] = pixels.shape;
  let original = pool.clone(pixels);
  let permuted = pool.clone(pixels);
  let [u, v] = [0, 0];

  for (let k = 0; k < times; k++) {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        u = ((i + epsilon * j) % m);
        v = ((phi * i + (epsilon * phi + 1) * j) % m);
        permuted.set(i, j, original.get(u, v));
      }
    }
    original = pool.clone(permuted);
  }
  return permuted;
}

async function diffusePixels(pixels, options) {
  const [m, n] = pixels.shape;

  let N = pool.clone(pixels);
  
  let key = pixels.get(0, 0);
  let P = pool.zeros(pixels.shape, 'uint8');
  ops.addseq(P, key);
  
  let Z = pool.zeros(pixels.shape, 'uint8');
  ops.bxor(Z, N, P);

  let refPixels = await imread(`../images/${options.refImgURL}`);
  let cipher = pool.clone(refPixels);

  let cipherValue = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      cipherValue = refPixels.get(i, j, options.rgbChannel) - Z.get(i, j);
      cipherValue = cipherValue >= 0 ? cipherValue : cipherValue + 256;
      cipher.set(i, j, options.rgbChannel, cipherValue);
    }
  }
  return cipher;
}

module.exports = encrypt;
