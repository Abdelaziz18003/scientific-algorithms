const pool = require("ndarray-scratch");
const {getSortIndexes, sortByIndexes} = require('../utils/array');

function encrypt (pixels, options = {x0: 0.456, u: 5.4321, k: 14, n0: 1000, lp: 600}) {
  let {x0, u, k, n0, lp} = options;
  let cipherImage = pool.clone(pixels);
  
  // permutation phase
  cipherImage.shape = [cipherImage.shape[0] * cipherImage.shape[1]];
  let x = chaoticMap(x0, u, k, cipherImage.shape[0], n0);
  let I = getSortIndexes(x);
  cipherImage.data = sortByIndexes(cipherImage.data, I);
  
  // diffusion phase
  let D = getDiffusionVector(x);
  cipherImage.data = diffusePixels(cipherImage.data, D);
  
  // rotation phase
  cipherImage.data = rotatePixels(cipherImage.data, lp);

  cipherImage.shape = pixels.shape;
  return cipherImage;
}

function chaoticMap (x0, u, k, iterations, n0) {
  let x = [x0];
  for (let i = 0; i < iterations + n0 - 1; i++) {
    let value = u * Math.sin(Math.PI * x[i]) * 2**k;
    x.push(value - Math.floor(value));
  }
  return x.slice(n0);
}

function getDiffusionVector (x) {
  let d = [];
  for (let i = 0; i < x.length; i++) {
    d.push((Math.floor(x[i] * 10 ** 14)) % 256);
  }
  return d;
}

function diffusePixels (pixels, diffusionVector) {
  let diffusedPixels = [];
  diffusedPixels[0] = pixels[0];
  for (let i = 1; i < pixels.length; i++) {
    diffusedPixels.push(((pixels[i] + diffusionVector[i]) % 256) ^ diffusedPixels[i-1]);
  }
  return diffusedPixels;
}

function rotatePixels (array, amount) {
  let newArray = [].concat(array);
  for (let i = 1; i <= amount; i++) {
    let element = newArray.shift();
    newArray.push(element);
  }
  return newArray;
}

module.exports = encrypt;