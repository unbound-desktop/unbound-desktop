const Cacher = require('./cacher');
const sucrase = require('sucrase');

class TS extends Cacher {
   compile(mdl, filename, content) {
      const { code } = sucrase.transform(content, {
         transforms: ['typescript', 'imports'],
         filePath: filename
      });

      return code;
   }

   get shouldInternallyCompile() {
      return true;
   }
};

module.exports = new TS();