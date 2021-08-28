const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");


const flatMap = (fn, list) => list.reduce((acc, x) => acc.concat(fn(x)), []);
const combine = (lists, items) => flatMap((item) => lists.map((list) => [...list, item]), items);
const combinations = (...lists) => lists.reduce(combine, [[]]);

const formats = ["amd", "cjs", "esm", "iife", "umd", "system"];
const minify = [false, true];
const config = combinations(formats, minify);

module.exports = config.map(([format, minify]) => ({
  input: "lib/json-pointer.js",
  output: {
    format: format,
    file: `dist/json-pointer-${format}${minify ? ".min" : ""}.js`,
    name: "JsonPointer",
    sourcemap: true,
    exports: "default"
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    minify && terser()
  ]
}));
