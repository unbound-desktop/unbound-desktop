const Webpack = require('@webpack');

const { logger } = require('@modules');
const Logger = new logger('Splash', 'Webpack');

const call = Function.prototype.call;
Function.prototype.call = function (...args) {
   try {
      if (args.length === 4 && typeof args[1] === 'object' && args[3].name !== '__webpack_require__') {
         const [, , , req] = args;
         Webpack.instance = req;
         Function.prototype.call = call;
         const res = call.apply(this, args);
         try {
            Logger.log('Successfully fetched.');
            require('./updater');
         } catch (err) {
            Logger.error('Failed to patch splash', err);
         }
         return res;
      }
   } catch (err) {
      Logger.error('Failed to fetch.', err);
      Function.prototype.call = call;
   }
   return call.apply(this, args);
};