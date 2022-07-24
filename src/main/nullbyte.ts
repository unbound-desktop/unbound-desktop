import { PATTERNS } from '@common/nullbyte';
import { existsSync } from 'fs';
import { resolve } from 'path';

const instance = resolve(__dirname, '..', '..', 'nullbyte', `nullbyte-${process.platform}.node`);

if (PATTERNS[process.platform] && existsSync(instance)) {
   try {
      const nullbyte = require(instance);
      const success = nullbyte.patch(process.pid, PATTERNS[process.platform]);
      if (!success) throw 0;
   } catch (e) {
      global.__ABORT__ = true;
      console.error('nullbyte failed patching, expect issues.');
   }
}