// Build script to inject API_URL into HTML
// This will be run during Vercel build

const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'https://your-api-server.com/api/stats';
const indexPath = path.join(__dirname, 'index.html');

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace('{{API_URL}}', apiUrl);
fs.writeFileSync(indexPath, html);

console.log('API URL injected:', apiUrl);
