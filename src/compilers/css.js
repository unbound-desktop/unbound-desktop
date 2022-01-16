const { readFileSync } = require('fs');
const Module = require('module');

Module._extensions['.css'] = (mdl, filename) => {
   const content = readFileSync(filename, 'utf-8');

   mdl.exports = content;

   return mdl.exports;
};