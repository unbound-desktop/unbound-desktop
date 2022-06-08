const { basename } = require('path');
const { readdirSync } = require('fs');

module.exports = class Commands {
   constructor() {
      this.commands = [];
   }

   register(client) {
      const commands = readdirSync(__dirname).filter(f => f !== basename(__filename)).map(file => {
         const items = file.split('.');
         if (items.length != 1) items.splice(items.length - 1, 1);

         return require(`${__dirname}/${file}`);
      });

      for (const Command of commands) {
         const instance = new Command(client);
         instance.register?.();

         this.commands.push(instance);
      }
   }

   remove() {
      for (const instance of this.commands) {
         instance.remove?.();
      }
   }
};