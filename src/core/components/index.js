const { appendCSS } = require('@utilities');
const styles = require('./styles');

if (!window.__SPLASH__) {
   for (const style of Object.keys(styles)) {
      appendCSS(`unbound-core-${style}`, styles[style]);
   }
}

require('fs')
   .readdirSync(__dirname)
   .filter(file => file !== require('path').basename(__filename)).map(file => {
      const items = file.split('.');
      items.splice(items.length - 1, 1);

      module.exports[items.join('.')] = require(`${__dirname}/${file}`);
   });