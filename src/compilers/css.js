const { readFileSync } = require('fs');
const Cacher = require('./cacher');

module.exports = new class CSS extends Cacher {
   compile(mdl, filename) {
      return readFileSync(filename, 'utf-8');
   }
};