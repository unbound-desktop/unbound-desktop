const CoffeeScript = require('coffeescript');
const { readFileSync } = require('fs');
const sucrase = require('sucrase');
const Module = require('module');

Module._extensions['.coffee'] = (mdl, filename) => {
   const content = readFileSync(filename, 'utf8');

   const compiled = CoffeeScript.compile(content);
   const { code } = sucrase.transform(compiled, {
      transforms: ['jsx', 'imports']
   });

   mdl._compile(code, filename);

   return mdl.exports;
};