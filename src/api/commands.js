const API = require('@structures/api');

const { bulk, filters } = require('@webpack');
const { bindAll } = require('@utilities');
const { avatar } = require('@constants');
const { create } = require('@patcher');

const Patcher = create('unbound-commands');

const [
   Commands,
   CommandsStore,
   Icons,
   SearchStore
] = bulk(
   filters.byProps('getContextCommands'),
   filters.byProps('getBuiltInCommands'),
   filters.byProps('getApplicationIconURL'),
   filters.byProps('SearchManagerStore')
);

class CommandsAPI extends API {
   constructor() {
      super();

      this.commands = new Map();
      this.section = {
         id: 'unbound',
         type: 1,
         name: 'Unbound',
         icon: avatar
      };

      bindAll(this, ['register', 'unregister']);
   }

   start() {
      Patcher.after(Commands, 'getContextCommands', (_, args, res) => {
         if (!args[0] || !args[0].query || !Array.isArray(res)) return;

         const { query } = args[0];

         for (const command of this.commands.values()) {
            if (!~command.name?.indexOf(query) || res.some(e => e.__unbound && e.id === command.id)) {
               continue;
            }

            try {
               res.unshift(command);
            } catch {
               // Discord calls Object.preventExtensions on the result when switching channels
               // Therefore, re-making the result array is required.
               res = [...res, command];
            }
         }
      });

      CommandsStore.BUILT_IN_SECTIONS['unbound'] = this.section;
      Patcher.instead(Icons, 'getApplicationIconURL', (self, args, orig) => {
         if (args[0]?.id === this.section.id) {
            return this.section.icon;
         }

         return orig.apply(self, args);
      });

      Patcher.after(SearchStore.SearchManagerStore, 'getChannelState', (_, args, res) => {
         if (!res.applicationSections?.find?.(s => s.id === this.section.id)) {
            res.applicationSections ??= [];
            res.applicationSections.push(this.section);
         }

         const commands = [...this.commands.values()];
         if (commands.some(c => !res.applicationCommands?.find?.(r => r.id === c.id))) {
            res.applicationCommands ??= [];
            // De-duplicate commands
            res.applicationCommands = [...new Set([...res.applicationCommands, ...commands]).values()];
         }
      });
   };

   stop() {
      delete CommandsStore.BUILT_IN_SECTIONS['unbound'];

      Patcher.unpatchAll();
   }

   register(options) {
      const { command, executor, ...cmd } = options;
      if (!command) return;

      this.commands.set(command, {
         type: 3,
         target: 1,
         id: command,
         name: command,
         applicationId: this.section.id,
         options: [],
         __unbound: true,
         execute: () => { },
         ...cmd
      });
   }

   unregister(id) {
      this.commands.delete(id);
   };
};

module.exports = new CommandsAPI();