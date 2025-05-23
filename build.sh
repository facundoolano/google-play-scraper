#!/bin/bash

rm -rf dist 
mkdir -p dist/esm
mkdir -p dist/cjs

# build esm
cp -r index.js index.d.ts lib dist/esm
cp package.json dist/esm/package.json

# build cjs
cp -r index.js index.d.ts lib dist/cjs
cp package.cjs.json dist/cjs/package.json


