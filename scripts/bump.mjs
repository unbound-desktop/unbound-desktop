import { execSync } from 'child_process';
import fs from 'fs';

const contents = fs.readFileSync('index.json', 'utf-8');
const manifest = JSON.parse(contents);
const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' });

manifest.version = tag.slice(1).trim();

fs.writeFileSync('index.json', JSON.stringify(manifest, null, 3));