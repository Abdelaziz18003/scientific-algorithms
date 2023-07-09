const pool = require("ndarray-scratch");
const {getSortIndexes, reverseSortByIndexes} = require('../utils/array');

function decrypt (cipherImage, options = {x0: 0.456, u: 5.4321, k: 14, n0: 1000, lp: 600}) {
  let {x0, u, k, n0, lp} = options;
  let plainImage = pool.clone(cipherImage);
  plainImage.shape = [plainImage.shape[0] * plainImage.shape[1]];

  let x = chaoticMap(x0, u, k, plainImage.shape[0], n0);
  let I = getSortIndexes(x);
  let D = getDiffusionVector(x);
  
  // reverse rotation phase
  plainImage.data = reverseRotatePixels(plainImage.data, lp);

  // reverse diffusion phase
  plainImage.data = reverseDiffusePixels(plainImage.data, D);

  // reverse permutation phase
  plainImage.data = reverseSortByIndexes(plainImage.data, I);

  plainImage.shape = cipherImage.shape;
  return plainImage;
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

function reverseDiffusePixels (cipherPixels, diffusionVector) {
  let permutedPixels = [];
  permutedPixels[0] = cipherPixels[0];
  for (let i = 1; i < cipherPixels.length; i++) {
    permutedPixels[i] = ((cipherPixels[i] ^ cipherPixels[i-1]) - diffusionVector[i]) % 256;
  }
  return new Uint8Array(permutedPixels);
}

function reverseRotatePixels (array, amount) {
  let newArray = Array.from(array);
  for (let i = 1; i <= amount; i++) {
    let element = newArray.pop();
    newArray.unshift(element);
  }
  return new Uint8Array(newArray);
}

module.exports = decrypt;