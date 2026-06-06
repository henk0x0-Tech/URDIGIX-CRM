const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.resolve(__dirname, '../../web/dist');
const destDir = path.resolve(__dirname, '../dist/renderer');

console.log(`Copying renderer files from ${srcDir} to ${destDir}...`);
if (fs.existsSync(srcDir)) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  copyRecursiveSync(srcDir, destDir);
  console.log('Renderer files copied successfully.');
} else {
  console.error(`Source directory ${srcDir} does not exist. Make sure to build the web package first.`);
  process.exit(1);
}
