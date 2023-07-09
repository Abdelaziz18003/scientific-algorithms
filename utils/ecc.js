/*
  All these operations are performed on the curve defined by:
  y^2 = x^3 + ax + b
  on [-n, n] interval
*/

// find the y coordinate of x on the curve
function ecc_y(a, b, n, x) {
  return Math.sqrt(x**3 + a * x + b) % n;
}

// add two points p1 & p2 on the curve
function ecc_add(a, b, n, p1, p2) {
  let [x1, y1] = p1;
  let [x2, y2] = p2;
  let x, y, beta;
  
  if (x1 == x2 && y1 == y2) {
    beta = (3 * (x1 ** 2) + a) / (2 * y1) % n;
  } else {
    beta = ((y2 - y1) / (x2 - x1)) % n;
  }
  x = (beta ** 2 - x1 - x2) % n;
  y = (beta * (x1 - x) - y1) % n;
  return [x, y];
}

// multiply a point p with a scalar k on the curve
// y ** 2 = x ** 3 + ax + b in [-n, n] interval

function ecc_mul(a, b, n, p, k) {
  let [x, y] = p;
  for (let i = 2; i <= k; i++) {
    [x, y] = ecc_add(a, b, n, [x, y], [x, y]);
  }
  return [x, y];
}

module.exports = {
  ecc_add,
  ecc_mul,
  ecc_y
};