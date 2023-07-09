const ndarray = require("ndarray");
const pool = require("ndarray-scratch");
const ops = require("ndarray-ops");
const imwrite = require("save-pixels");
const fs = require("node:fs");
const tile = require("ndarray-tile");

const a = pool.zeros([32, 32]);
ops.addseq(a, 255);
const b = pool.zeros([32, 32]);
ops.addseq(b, 100);
const c = pool.zeros([32, 32]);
const img = pool.zeros([32, 32, 3]);
ops.assign(img.pick(null, null, 0), a);
ops.assign(img.pick(null, null, 1), b);
ops.assign(img.pick(null, null, 2), c);

console.log(img.get(0, 0, 0));
console.log(img.get(0, 0, 1));
console.log(img.get(0, 0, 2));
imwrite(c, "png").pipe(fs.createWriteStream("test.png"));
