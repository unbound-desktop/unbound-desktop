const Cacher = require('./cacher');
const SASS = require('sass');

class SCSS extends Cacher {
   compile(mdl, filename) {
      return SASS.compile(filename, {}).css.toString();
   }
};

module.exports = new SCSS();