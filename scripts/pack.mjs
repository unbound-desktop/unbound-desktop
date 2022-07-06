import { createPackage } from 'asar';
import fse from 'fs-extra';
import path from 'path';
import url from 'url';

// @ts-ignore
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const root = path.resolve(__dirname, '..');
const temp = path.resolve(root, 'unbound-packer');
if (fse.existsSync(temp)) fse.removeSync(temp);

const bundle = path.resolve(root, 'dist');

// Copy all preload/main/renderer handlers
const dist = (() => {
  try {
    return fse.readdirSync(bundle);
  } catch (e) {
    return [];
  }
})();

if (!dist.length) {
  log('warning', 'There are no files in dist or dist is not found, did you build with "npm run build"?');
}

for (const file of dist) {
  try {
    fse.copySync(path.resolve(bundle, file), path.resolve(temp, 'dist', file));
    log('success', `Copied dist/${file}`);
  } catch (e) {
    log('error', `Failed to copy dist/${file}`);
  }
}

// Copy kernel manifest
try {
  fse.copySync(path.resolve(root, 'index.json'), path.resolve(temp, 'index.json'));
  log('success', 'Copied kernel manifest');
} catch {
  log('error', 'Failed to copy kernel manifest');
}

// Copy node package
try {
  fse.copySync(path.resolve(root, 'package.json'), path.resolve(temp, 'package.json'));
  log('success', 'Copied node package.json');
} catch {
  log('error', 'Failed to copy node package.json');
}

// Copy nullbyte binaries
try {
  fse.copySync(path.resolve(root, 'nullbyte'), path.resolve(temp, 'nullbyte'));
  log('success', 'Copied nullbyte binaries');
} catch {
  log('error', 'Failed to copy nullbyte binaries');
}

for (const file of ['main', 'preload']) {
  try {
    fse.copySync(path.resolve(root, `${file}.js`), path.resolve(temp, `${file}.js`));
    log('success', `Copied ${file} handler`);
  } catch {
    log('error', `Failed to copy ${file} handler`);
  }
}

try {
  createPackage(temp, 'unbound.asar').then(() => {
    console.log('\n');
    log('success', `Created unbound.asar`);
    try {
      fse.removeSync(temp);
      log('success', 'Deleted temporary directory');
    } catch (e) {
      log('error', 'Couldn\'t delete temporary directory');
    }
  });
} catch {
  log('error', 'Failed to pack temp directory into asar');
}

function log(type = 'success', ...message) {
  let prefix = '';

  switch (type) {
    case 'success':
      prefix = '\u001b[32m✔\u001b[0m ';
      break;
    case 'error':
      prefix = '\u001b[31m⛌\u001b[0m ';
      break;
    case 'warning':
      prefix = '\u001b[33m⚠\u001b[0m ';
      break;
  }

  return console.log(prefix, ...message);
}

process.on('uncaughtException', () => { });