const patterns = require('./patterns');
const path = require('path');
const fs = require('fs');

const instance = path.resolve(__dirname, `nullbyte-${process.platform}.node`);
if (patterns[process.platform] && fs.existsSync(instance)) {
   const nullbyte = require(`./nullbyte-${process.platform}`);

   nullbyte.patch(process.pid, patterns[process.platform]);
}