const { readdirSync } = require('fs');
const { basename } = require('path');

readdirSync(__dirname).filter(f => f !== basename(__filename)).map(file => {
   const items = file.split('.');
   if (items.length != 1) items.splice(items.length - 1, 1);

   module.exports[items.join('.')] = require(`${__dirname}/${file}`);
});