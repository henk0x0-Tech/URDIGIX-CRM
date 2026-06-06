const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const destDir = path.resolve(__dirname, '../resources/api');

console.log(`Deploying API to ${destDir}...`);

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

try {
  // Use pnpm deploy to copy the API package and all its dependencies
  execSync(`pnpm deploy --filter @urdigix/api apps/desktop/resources/api --legacy`, {
    cwd: path.resolve(__dirname, '../../../'), // Project root
    stdio: 'inherit'
  });
  console.log('API deployed successfully.');
} catch (error) {
  console.error('Failed to deploy API:', error);
  process.exit(1);
}
