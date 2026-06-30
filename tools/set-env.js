const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const indexPath = path.join(__dirname, '..', 'src', 'index.html');

if (!fs.existsSync(envPath)) {
  console.warn('⚠️  No .env file found. Run with placeholder API key.');
  process.exit(0);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const keyMatch = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);

let apiKey = '';
if (keyMatch) {
  apiKey = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
}

let html = fs.readFileSync(indexPath, 'utf-8');
html = html.replace(
  /window\.env\s*=\s*\{[^}]*\}/,
  `window.env = { GEMINI_API_KEY: '${apiKey}' }`
);
fs.writeFileSync(indexPath, html, 'utf-8');

if (apiKey) {
  console.log(`✅ GEMINI_API_KEY injected (${apiKey.substring(0, 8)}...)`);
} else {
  console.warn('⚠️  No GEMINI_API_KEY found in .env');
}
