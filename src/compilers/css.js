const Cacher = require('./cacher');

module.exports = new class CSS extends Cacher {
   compile(mdl, filename, content) {
      return content;
   }
};