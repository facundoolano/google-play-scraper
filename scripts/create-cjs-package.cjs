const fs = require('fs-extra');
const path = require('path');

async function createCjsPackage() {
  try {
    const cjsDir = path.join(process.cwd(), 'dist', 'cjs');
    await fs.ensureDir(cjsDir);
    
    const packageJson = {
      type: 'commonjs'
    };
    
    await fs.writeJson(
      path.join(cjsDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
    
    console.log('CJS package.json created successfully!');
  } catch (error) {
    console.error('Error creating CJS package.json:', error);
    process.exit(1);
  }
}

createCjsPackage();
