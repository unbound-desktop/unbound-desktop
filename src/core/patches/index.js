require('fs')
   .readdirSync(__dirname)
   .filter(file => file !== require('path').basename(__filename)).map(file => {
      const items = file.split('.');
      if (items.length != 1) items.splice(items.length - 1, 1);

      module.exports[items.join('.')] = require(`${__dirname}/${file}`);
   });