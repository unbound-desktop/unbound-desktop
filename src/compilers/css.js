const Cacher = require('./cacher');

class CSS extends Cacher {
   compile(mdl, filename, content) {
      return content;
   }
};

module.exports = new CSS();