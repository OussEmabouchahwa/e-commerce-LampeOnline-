const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const target = path.join(distDir, 'server.js');
const content = "require('./apps/api/src/server.js');\n";

fs.writeFileSync(target, content, 'utf8');
console.log('Created dist/server.js entrypoint successfully.');
