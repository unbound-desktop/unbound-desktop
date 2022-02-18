const Cacher = require('./cacher');
const SASS = require('sass');

module.exports = new class SCSS extends Cacher {
   compile(mdl, filename) {
      return SASS.compile(filename, {}).css.toString();
   };
};