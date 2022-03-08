const { copyFileSync, existsSync, unlinkSync, readFileSync, readdirSync } = require('fs');
const { uuid } = require('../src/modules/utilities');
const { join } = require('path');

const isWindows = process.platform === 'win32';
const instance = `unisolate-${process.platform}.node`;
const id = uuid(5);

if (!existsSync(join(__dirname, instance))) {
   throw new Error(`${process.platform} is not supported by Unbound.`);
}

if (isWindows) {
   const files = readdirSync(__dirname);

   for (const previous of files.filter(e => e.includes('running'))) {
      try {
         unlinkSync(join(__dirname, previous));
      } catch (e) {
         console.error('Failed to cleanup previous unisolated instance.', e);
      }
   }

   const copy = join(__dirname, `running-${id}.node`);
   const original = join(__dirname, instance);

   copyFileSync(original, copy);
}

try {
   const data = readFileSync(join(__dirname, 'unisolate.data'));

   const patcher = isWindows ? `running-${id}.node` : instance;
   const path = join(__dirname, patcher);
   const unisolate = require(path);

   unisolate.patch(data);
} catch (e) {
   console.error('Failed to unisolate.', e);
}