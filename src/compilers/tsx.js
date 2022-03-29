const Cacher = require('./cacher');
const sucrase = require('sucrase');

class TSX extends Cacher {
   compile(mdl, filename, content) {
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

module.exports = new TSX();