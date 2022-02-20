const Cacher = require('./cacher');
const sucrase = require('sucrase');

module.exports = new class TS extends Cacher {
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