#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create docs directory for local testing
const docsDir = path.join(__dirname, 'docs');
const siteDir = path.join(__dirname, 'src', 'site');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Copy site contents to docs for local testing
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy site to docs for local testing
copyDir(siteDir, docsDir);

console.log('✅ Site files prepared for local testing!');
console.log('📁 Site files copied to docs/ directory');
console.log('🚀 GitHub Pages will deploy directly from src/site/');
console.log('');
console.log('To test locally:');
console.log('  cd docs && python -m http.server 8000');
console.log('  Then visit http://localhost:8000');
console.log('');
console.log('Or test the site folder directly:');
console.log('  cd src/site && python -m http.server 8000');
