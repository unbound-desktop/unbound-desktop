const { copyFileSync, existsSync, unlinkSync, readFileSync } = require('fs');
const { join } = require('path');

const isWindows = process.platform === 'win32';

const instance = `unisolate-${process.platform}.node`;
if (!existsSync(join(__dirname, instance))) {
   throw new Error(`${process.platform} is not supported by Unbound.`);
}

if (isWindows) {
   const previous = join(__dirname, 'unisolated.node');

   if (existsSync(previous)) {
      try {
         unlinkSync(previous);
      } catch (e) {
         console.error('Failed to cleanup previous unisolated instance.', e);
      }
   }

   const copy = join(__dirname, 'unisolated.node');
   const original = join(__dirname, instance);

   copyFileSync(original, copy);
}

try {
   const data = readFileSync(join(__dirname, 'unisolate.data'));

   const patcher = isWindows ? 'unisolated.node' : instance;
   const path = join(__dirname, patcher);
   const unisolate = require(path);

   unisolate.patch(data);
} catch (e) {
   console.error('Failed to unisolate.', e);
}