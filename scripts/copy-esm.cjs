const fs = require('fs-extra');
const path = require('path');

async function copyESMFiles () {
  try {
    // Create dist/esm directory
    const distDir = path.join(process.cwd(), 'dist', 'esm');
    await fs.ensureDir(distDir);

    // Copy lib directory
    await fs.copy(
      path.join(process.cwd(), 'lib'),
      path.join(distDir, 'lib')
    );

    // Copy index.js
    await fs.copyFile(
      path.join(process.cwd(), 'index.js'),
      path.join(distDir, 'index.js')
    );

    console.log('ESM files copied successfully!');
  } catch (error) {
    console.error('Error copying ESM files:', error);
    process.exit(1);
  }
}

copyESMFiles();
