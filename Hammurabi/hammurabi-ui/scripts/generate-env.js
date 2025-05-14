// scripts/generate-env.js
require('dotenv').config({ path: '.env.local' }); // ← load your local env
require('dotenv').config({ path: '.env' });       // ← fallback to .env

const fs   = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'public', 'env-config.js.template');
const targetPath   = path.join(__dirname, '..', 'public', 'env-config.js');

let content = fs.readFileSync(templatePath, 'utf8');

content = content.replace(/\$\{(\w+)\}/g, (_, key) => {
  return process.env[key] || '';
});

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`✅  Wrote public/env-config.js`);
