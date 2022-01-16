const { readFileSync } = require('fs');
const sucrase = require('sucrase');
const Module = require('module');

Module._extensions['.ts'] = (mdl, filename) => {
   const content = readFileSync(filename, 'utf-8');

   const { code } = sucrase.transform(content, {
      transforms: ['imports', 'typescript'],
      filePath: filename
   });

   mdl._compile(code, filename);

   return mdl.exports;
};