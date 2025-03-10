const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(pkg => {
  if (pkg === 'utils') return; // Skip utils as it already has a build script
  
  const packageJsonPath = path.join(packagesDir, pkg, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Fix exports field
    if (packageJson.exports && typeof packageJson.exports === 'object') {
      const { types, require, import: importPath } = packageJson.exports;
      
      if (types || require || importPath) {
        packageJson.exports = {
          '.': {
            ...(types ? { types } : {}),
            ...(require ? { require } : {}),
            ...(importPath ? { import: importPath } : {})
          }
        };
      }
    }
    
    // Add build script if missing
    if (!packageJson.scripts.build) {
      if (packageJson.scripts['build:pkg']) {
        packageJson.scripts.build = 'pnpm run build:pkg';
      } else if (packageJson.scripts['build-fast:pkg']) {
        packageJson.scripts.build = 'pnpm run build-fast:pkg --dts';
      }
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Fixed package.json for ${pkg}`);
  }
});

console.log('All packages fixed!'); 