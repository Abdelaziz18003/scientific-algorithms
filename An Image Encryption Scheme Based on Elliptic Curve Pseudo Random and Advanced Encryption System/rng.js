const { ecc_add, ecc_mul, ecc_y} = require('../utils/ecc');

function rng(curve, primary_key, alpha, Y, G) {
  let [a, b, n] = curve;
  let SK = [], Z = [];
  let A, B, C;
  SK.push(primary_key);
  for (let i = 0; i < alpha; i++) {
    A = ecc_mul(a, b, n, G, SK[i]);
    B = ecc_add(a, b, n, A, Y);
    C = ecc_add(a, b, n, B, G);
    Z.push(Math.abs(A[0] * B[0] * C[0]));
    SK.push(A[1] + B[1] + C[1]);
  }
  return Z;
}
