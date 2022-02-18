const { readFileSync } = require('fs');
const Cacher = require('./cacher');
const sucrase = require('sucrase');

module.exports = new class TSX extends Cacher {
   compile(mdl, filename) {
      const content = readFileSync(filename, 'utf-8');

      const { code } = sucrase.transform(content, {
         transforms: ['typescript', 'imports', 'jsx'],
         filePath: filename
      });

      return code;
   }

   get shouldInternallyCompile() {
      return true;
   }
};