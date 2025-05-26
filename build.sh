#!/bin/bash

npm ci

rm -rf dist 
mkdir -p dist/esm
mkdir -p dist/cjs

# build esm
cp -r index.js index.d.ts lib dist/esm
cp package.json dist/esm/package.json

# build cjs - use babel to convert to commonjs
babel index.js --out-file dist/cjs/index.js
babel lib --out-dir dist/cjs/lib
cp index.d.ts dist/cjs/index.d.ts
cp package.cjs.json dist/cjs/package.json
