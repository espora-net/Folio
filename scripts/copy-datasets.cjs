const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const publicApiDir = path.resolve(__dirname, '..', 'public', 'api');
const indexPath = path.join(dataDir, 'db.json');

if (!fs.existsSync(indexPath)) {
  console.error('Index file not found:', indexPath);
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const datasets = Array.isArray(index.datasets) ? index.datasets.map(d => d.file) : [];

// Always ensure the public/api directory exists
fs.mkdirSync(publicApiDir, { recursive: true });

// Copy each dataset file if present
for (const file of datasets) {
  const src = path.join(dataDir, file);
  const dest = path.join(publicApiDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('copied', src, '->', dest);
  } else {
    console.warn('dataset file not found, skipping:', src);
  }
}

console.log('copy-datasets complete');
