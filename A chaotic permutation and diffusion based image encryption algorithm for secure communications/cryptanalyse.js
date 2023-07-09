const fs = require('fs');
const imread = require('get-pixels');
const imshow = require('gnuplot-imshow');
const imhist = require('ndarray-imhist');
const imwrite = require('save-pixels');
const pool = require('ndarray-scratch');

const encrypt = require('./encrypt');
const { sortByIndexes } = require('../utils/array');

imread('./cipher-image.png', (err, pixels) => {
  pixels = pool.clone(pixels.pick(null, null, 0));

  // reverse diffusion 
  let R = getRandomNumber(pixels);
  let plain = reverseDiffusion(pixels, R);

  // reverse swap
  let permutationVector = getPermutationVector(pixels, R);
  plain.data = sortByIndexes(plain.data, permutationVector);
  
  // show result
  imshow(plain);
  imhist(plain);
});

function getRandomNumber (pixels) {
  let [m, n] = pixels.shape;
  let zerosImage = pool.zeros(pixels.shape);
  let encryptedZeros = encrypt(zerosImage);
  return (encryptedZeros.get(0, 0) ^ (m/(0 + 1) + n/(0 + 1))) % 256;
}

function reverseDiffusion (cipher, R) {
  let r = 0;
  let c = 0;
  let p = 0;
  let [m, n] = cipher.shape;
  let plain = pool.zeros([m, n]);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      c = cipher.get(i, j);
      t = (m/(i + 1) + n/(j + 1));
      if (i == 0 || j == 0) {
        r = R % 256;
      } else {
        r = (plain.get(i-1, j-1) + R) % 256;
      }
      p = (r ^ c ^ t) % 256;
      plain.set(i, j, p);
    }
  }
  return plain;
}

function getPermutationVector (cipherImage, R) {
  let permutationVector = [];
  for (let j = 0; j < cipherImage.data.length; j++) {
    let plain = pool.zeros(cipherImage.shape);
    plain.data[j] = 255;
    let cipher = encrypt(plain);
    let permuted = reverseDiffusion(cipher, R);
    permutationVector[j] = permuted.data.indexOf(255);
  }
  return permutationVector;
}
