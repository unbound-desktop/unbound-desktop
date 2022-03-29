const Cacher = require('./cacher');
const sucrase = require('sucrase');

class JSX extends Cacher {
   compile(mdl, filename, content) {
      const { code } = sucrase.transform(content, {
         transforms: ['jsx', 'flow', 'imports'],
         filePath: filename
      });

      return code;
   }

   get shouldInternallyCompile() {
      return true;
   }
};

module.exports = new JSX();