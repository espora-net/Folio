import fs from 'fs';
import path from 'path';

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const dataFile = path.join(process.cwd(), 'data/db.json');
const publicApiFile = path.join(process.cwd(), 'public/api/db.json');

if (fs.existsSync(dataFile)) {
  try {
    fs.mkdirSync(path.dirname(publicApiFile), { recursive: true });
    fs.copyFileSync(dataFile, publicApiFile);
  } catch (error) {
    console.warn('Unable to copy data/db.json to public/api/db.json', error);
  }
}

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
