import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import external from "rollup-plugin-peer-deps-external";
import babel from "@rollup/plugin-babel";
import packageJson from "./package.json";

// const packageJson = require("./package.json");

const extensions = [".js", ".ts", ".tsx", ".jsx", ".json"];

export default {
  input: "src/index.js",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
      name: "hardtail",
    },
    {
      file: packageJson.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    resolve(),
    commonjs(),
    babel({
      include: "src/**/*",
      exclude: "**/node_modules/**",
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"],
      extensions,
    }),
    terser(),
  ],
};
