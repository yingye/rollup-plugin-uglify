const assert = require("assert");
const { rollup } = require("rollup");
const { readFileSync: readFile } = require("fs");
const { uglify } = require("../");

test("minify", async () => {
  const bundle = await rollup({
    input: "test/fixtures/unminified.js",
    plugins: [uglify()]
  });
  const result = await bundle.generate({ format: "cjs" });
  expect(result.code).toEqual(
    '"use strict";window.a=5,window.a<3&&console.log(4);\n'
  );
  expect(result.map).toBeFalsy();
});

test("minify via uglify options", async () => {
  const bundle = await rollup({
    input: "test/fixtures/empty.js",
    plugins: [uglify({ output: { comments: "all" } })]
  });
  const result = await bundle.generate({
    banner: "/* package name */",
    format: "cjs"
  });
  expect(result.code).toEqual('/* package name */\n"use strict";\n');
  expect(result.map).toBeFalsy();
});

test("minify with sourcemaps", async () => {
  const bundle = await rollup({
    input: "test/fixtures/sourcemap.js",
    plugins: [uglify()]
  });
  const result = await bundle.generate({ format: "cjs", sourcemap: true });
  expect(result.map).toBeTruthy();
});

test("throw error on uglify fail", async () => {
  try {
    const bundle = await rollup({
      input: "test/fixtures/failed.js",
      plugins: [
        {
          transformBundle: () => ({ code: "var = 1" })
        },
        uglify()
      ]
    });
    await bundle.generate({ format: "esm" });
    expect(true).toBeFalsy();
  } catch (error) {
    expect(error.toString()).toMatch(/Name expected/);
  }
});

test("works with code splitting", async () => {
  const bundle = await rollup({
    input: ["test/fixtures/chunk-1.js", "test/fixtures/chunk-2.js"],
    experimentalCodeSplitting: true,
    plugins: [uglify()]
  });
  const { output } = await bundle.generate({ format: "esm" });
  expect(output).toMatchSnapshot();
});
