const Module = require('module');
const SASS = require('sass');

Module._extensions['.scss'] = (mdl, filename) => {
   mdl.exports = SASS.compile(filename, {}).css.toString();

   return mdl.exports;
};