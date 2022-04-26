const Webpack = require('@webpack');

const { createLogger } = require('@modules/logger');
const Logger = createLogger('Splash', 'Webpack');

const call = Function.prototype.call;
Function.prototype.call = function (...args) {
   try {
      if (args.length === 4 && typeof args[1] === 'object' && args[3].name !== '__webpack_require__') {
         Webpack.instance = args[3];
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