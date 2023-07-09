const pool = require("ndarray-scratch");
const { mean } = require("../utils/array");
const ops = require("ndarray-ops");

function encrypt(pixels, key, rounds = 2) {
  let cipherImage = pool.clone(pixels);

  // permutation phase
  let m = cipherImage.shape[0];
  let n = cipherImage.shape[1];
  let dimension = pixels.dimension;

  for (let channel = 0; channel < dimension; channel++) {
    let cipherChannel = cipherImage.pick(null, null, channel);
    for (let round = 1; round <= rounds; round++) {
      let { xi, dm, dn } = getInitialValuesFromKey(key, m, n);

      let pr = bulbanMap(xi[0], m).map((v) => Math.floor((v * 10 ** 5) % m));
      let pc = bulbanMap(xi[1], n).map((v) => Math.floor((v * 10 ** 5) % n));

      // shuffle rows
      for (let i = 0; i < pr.length; i++) {
        cipherChannel = rotateRow(cipherChannel, i, pr[i]);
      }

      // shuffle columns
      for (let i = 0; i < pr.length; i++) {
        cipherChannel = rotateColumn(cipherChannel, i, pc[i]);
      }

      // generating vectors
      let drUp = bulbanMap(xi[2], n).map((v) =>
        Math.floor((v * 10 ** 5) % 256)
      );
      let drDown = bulbanMap(xi[3], n).map((v) =>
        Math.floor((v * 10 ** 5) % 256)
      );
      let dcleft = bulbanMap(xi[4], m).map((v) =>
        Math.floor((v * 10 ** 5) % 256)
      );
      let dcRight = bulbanMap(xi[5], m).map((v) =>
        Math.floor((v * 10 ** 5) % 256)
      );

      // substitue rows
      for (let i = 0; i <= Math.floor(m / 2 + dm); i++) {
        for (let j = 0; j < n; j++) {
          const pred =
            i == 0 ? cipherChannel.get(m - 1, j) : cipherChannel.get(i - 1, j);
          const value = (cipherChannel.get(i, j) + (drUp[j] ^ pred)) % 256;
          cipherChannel.set(i, j, value);
        }
      }

      for (let i = m - 1; i >= Math.floor(m / 2 - dm); i--) {
        for (let j = 0; j < n; j++) {
          const succ =
            i == m - 1 ? cipherChannel.get(0, j) : cipherChannel.get(i + 1, j);
          const value = (cipherChannel.get(i, j) + (drDown[j] ^ succ)) % 256;
          cipherChannel.set(i, j, value);
        }
      }

      // substitute columns
      for (let j = 0; j <= Math.floor(n / 2 + dn); j++) {
        for (let i = 0; i < m; i++) {
          const pred =
            j == 0 ? cipherChannel.get(i, n - 1) : cipherChannel.get(i, j - 1);
          const value = (cipherChannel.get(i, j) + (dcleft[i] ^ pred)) % 256;
          cipherChannel.set(i, j, value);
        }
      }

      for (let j = n - 1; j >= Math.floor(n / 2 - dn); j--) {
        for (let i = 0; i < m; i++) {
          const succ =
            j == n - 1 ? cipherChannel.get(i, 1) : cipherChannel.get(i, j + 1);
          const value = (cipherChannel.get(i, j) + (dcRight[i] ^ succ)) % 256;
          cipherChannel.set(i, j, value);
        }
      }
    }
    ops.assign(cipherImage.pick(null, null, channel), cipherChannel);
  }
  return cipherImage;
}

// non-sense algorithm
function getInitialValuesFromKey(kr, m, n) {
  let krArr = kr.split("").map((c) => Number(c));
  krArr.unshift(0);
  let xi = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 1; i <= 6; i++) {
    let d = (i - 1) * 60;
    let e = 1;
    for (let j = 1; j <= 8; j++) {
      e = e + krArr[d + j] * 2 ** j;
    }
    for (let j = 9; j <= 60; j++) {
      xi[i] = xi[i] + krArr[d + j] * 2 ** (8 - j);
    }
    xi[i] = xi[i] * 2 ** e;
    if (xi[i] == 2 || xi[i] == 2.5) {
      xi[i] = xi[i] + 0.1;
    }
  }
  for (let j = 1; j <= 6; j++) {
    xi[j] = (mean(xi.slice(1)) + xi[j]) / 2;
  }

  // the original map algorithm is not outputting random values, so we keep it to measure performance
  // but replace the ouput with different random values to have the rest of the algorithm working
  xi = xi.map((val) => Number(String(val).split("e+")[0]) % 1).slice(1);

  let dm = Math.floor(mean(xi.slice(1, 4)) * 10 ** 5) % (m / 4);
  let dn = Math.floor(mean(xi.slice(4, 7)) * 10 ** 5) % (n / 4);

  return { xi, dm, dn };
}

// the originl bulban map doesn't produce chaotic sequence so it was replaced
function bulbanMap(x0, iterations, n0 = 0) {
  let x = [x0];
  const u = 5.4321;
  const k = 14;
  for (let i = 0; i < iterations + n0 - 1; i++) {
    let value = u * Math.sin(Math.PI * x[i]) * 2 ** k;
    x.push(value - Math.floor(value));
  }
  return x.slice(n0);
}

function rotateRow(ndarray, rowIndex, number) {
  const row = ndarray.pick(rowIndex, null);
  const rowLength = row.shape[0];
  const rotatedArray = new Uint8Array(rowLength);
  for (let i = 0; i < rowLength; i++) {
    const targetIndex = (i + number) % rowLength;
    rotatedArray.set([ndarray.get(rowIndex, i)], targetIndex);
  }
  for (let i = 0; i < rowLength; i++) {
    ndarray.set(rowIndex, i, rotatedArray[i]);
  }
  return ndarray;
}

function rotateColumn(ndarray, columnIndex, number) {
  const column = ndarray.pick(null, columnIndex);
  const columnLength = column.shape[0];
  const rotatedArray = new Uint8Array(columnLength);
  for (let i = 0; i < columnLength; i++) {
    const targetIndex = (i + number) % columnLength;
    rotatedArray.set([ndarray.get(i, columnIndex)], targetIndex);
  }
  for (let i = 0; i < columnLength; i++) {
    ndarray.set(i, columnIndex, rotatedArray[i]);
  }
  return ndarray;
}

module.exports = encrypt;
