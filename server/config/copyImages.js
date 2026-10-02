import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../public/uploads');
const sourceDir = 'C:\\Users\\ander\\.gemini\\antigravity-ide\\brain\\686fcb3d-ec6a-4032-8a5f-899bb313fed1\\.user_uploaded';

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(uploadsDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`📸 Copiada imagen: ${file} -> ${destPath}`);
  });
}
