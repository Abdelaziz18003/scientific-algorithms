const pool = require("ndarray-scratch");
const { mean } = require("../utils/array");

function decrypt(pixels, key, rounds = 2) {
  let plainImage = pool.clone(pixels);

  let m = plainImage.shape[0];
  let n = plainImage.shape[1];

  for (let round = 1; round <= rounds; round++) {
    let { xi, dm, dn } = getInitialValuesFromKey(key, m, n);

    let pr = bulbanMap(xi[0], m).map((v) => Math.floor((v * 10 ** 5) % m));
    let pc = bulbanMap(xi[1], n).map((v) => Math.floor((v * 10 ** 5) % n));

    // generating vectors
    let drUp = bulbanMap(xi[2], n).map((v) => Math.floor((v * 10 ** 5) % 256));
    let drDown = bulbanMap(xi[3], n).map((v) =>
      Math.floor((v * 10 ** 5) % 256)
    );
    let dcleft = bulbanMap(xi[4], m).map((v) =>
      Math.floor((v * 10 ** 5) % 256)
    );
    let dcRight = bulbanMap(xi[5], m).map((v) =>
      Math.floor((v * 10 ** 5) % 256)
    );

    // substitute columns
    for (let j = Math.floor(n / 2 - dn); j <= n - 1; j++) {
      for (let i = 0; i < m; i++) {
        const succ =
          j == n - 1 ? plainImage.get(i, 1) : plainImage.get(i, j + 1);
        let value = plainImage.get(i, j) - (dcRight[i] ^ succ);
        value = value > 0 ? value % 256 : value + 256;
        plainImage.set(i, j, value);
      }
    }

    for (let j = Math.floor(n / 2 + dn); j >= 0; j--) {
      for (let i = 0; i < m; i++) {
        const pred =
          j == 0 ? plainImage.get(i, n - 1) : plainImage.get(i, j - 1);
        let value = plainImage.get(i, j) - (dcleft[i] ^ pred);
        value = value > 0 ? value % 256 : value + 256;
        plainImage.set(i, j, value);
      }
    }

    // substitue rows
    for (let i = Math.floor(m / 2 - dm); i <= m - 1; i++) {
      for (let j = 0; j < n; j++) {
        const succ =
          i == m - 1 ? plainImage.get(0, j) : plainImage.get(i + 1, j);
        let value = plainImage.get(i, j) - (drDown[j] ^ succ);
        value = value > 0 ? value % 256 : value + 256;
        plainImage.set(i, j, value);
      }
    }

    for (let i = Math.floor(m / 2 + dm); i >= 0; i--) {
      for (let j = 0; j < n; j++) {
        const pred =
          i == 0 ? plainImage.get(m - 1, j) : plainImage.get(i - 1, j);
        let value = plainImage.get(i, j) - (drUp[j] ^ pred);
        value = value > 0 ? value % 256 : value + 256;
        plainImage.set(i, j, value);
      }
    }

    // shuffle columns
    for (let i = 0; i < pr.length; i++) {
      plainImage = inverseRotateColumns(plainImage, i, pc[i]);
    }

    // shuffle rows
    for (let i = 0; i < pr.length; i++) {
      plainImage = inverseRotateRows(plainImage, i, pr[i]);
    }
  }

  return plainImage;
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

  // the algorithm is not working, so we keep it to measure performance but replace the ouput with random values
  xi = xi.map((val) => Number(String(val).split("e+")[0]) % 1).slice(1);

  let dm = Math.floor(mean(xi.slice(1, 4)) * 10 ** 5) % (m / 4);
  let dn = Math.floor(mean(xi.slice(4, 7)) * 10 ** 5) % (n / 4);

  return { xi, dm, dn };
}

// this should be called shit map not bulban map
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

function inverseRotateRows(ndarray, rowIndex, number) {
  const row = ndarray.pick(rowIndex, null);
  const rowLength = row.shape[0];
  const rotatedArray = new Uint8Array(rowLength);
  for (let i = rowLength - 1; i >= 0; i--) {
    const targetIndex = (i + number) % rowLength;
    rotatedArray.set([ndarray.get(rowIndex, targetIndex)], i);
  }
  for (let i = 0; i < rowLength; i++) {
    ndarray.set(rowIndex, i, rotatedArray[i]);
  }
  return ndarray;
}

function inverseRotateColumns(ndarray, columnIndex, number) {
  const column = ndarray.pick(null, columnIndex);
  const columnLength = column.shape[0];
  const rotatedArray = new Uint8Array(columnLength);
  for (let i = columnLength - 1; i >= 0; i--) {
    const targetIndex = (i + number) % columnLength;
    rotatedArray.set([ndarray.get(targetIndex, columnIndex)], i);
  }
  for (let i = 0; i < columnLength; i++) {
    ndarray.set(i, columnIndex, rotatedArray[i]);
  }
  return ndarray;
}

module.exports = decrypt;
