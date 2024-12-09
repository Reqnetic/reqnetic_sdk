import { defineConfig } from "vite";
import packageJson from "./package.json";
/// <reference types="vitest" />
import path from "path";

const getPackageName = () => {
  return packageJson.name.split("/").pop();
};

const getPackageNameCamelCase = () => {
  try {
    return (getPackageName() as string).replace(/-./g, (char) => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `${getPackageName()}.mjs`,
  cjs: `${getPackageName()}.cjs`,
  iife: `${getPackageName()}.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

module.exports = defineConfig({
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: getPackageNameCamelCase(),
      formats,
      fileName: (format) => fileName[format],
    },
  }, 
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'globalThis.process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }
});
