import fs from 'fs';
import path from 'path';

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const dataFile = path.join(process.cwd(), 'data/db.json');
const publicApiFile = path.join(process.cwd(), 'public/api/db.json');
const dataDir = path.join(process.cwd(), 'data');
const publicApiDir = path.join(process.cwd(), 'public/api');

if (fs.existsSync(dataFile)) {
  try {
    fs.mkdirSync(path.dirname(publicApiFile), { recursive: true });
    fs.copyFileSync(dataFile, publicApiFile);
  } catch (error) {
    console.warn('Unable to copy data/db.json to public/api/db.json', error);
  }
}

try {
  const datasetFiles = fs
    .readdirSync(dataDir)
    .filter(file => file.startsWith('db-') && file.endsWith('.json'));

  for (const file of datasetFiles) {
    const source = path.join(dataDir, file);
    const target = path.join(publicApiDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
} catch (error) {
  console.warn('Unable to copy dataset files to public/api', error);
}

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
