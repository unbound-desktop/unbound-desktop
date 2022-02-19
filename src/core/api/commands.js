const API = require('@structures/api');

const { after, unpatchAll } = require('@patcher');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const { avatar } = require('@constants');
const { send } = require('@api/clyde');

const [
   Channels,
   Messages,
   AssetUtils,
   CommandUtils,
   CommandsStore
] = getByProps(
   ['getLastSelectedChannelId'],
   ['sendMessage'],
   ['getApplicationIconURL'],
   ['useApplicationCommandsDiscoveryState'],
   ['queryCommands'],
   { bulk: true }
);

module.exports = new class Commands extends API {
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
      after('unbound-commands', AssetUtils, 'getApplicationIconURL', (_, [section]) => {
         if (section.id === 'unbound') return avatar;
      });

      after('unbound-commands', CommandsStore, 'queryCommands', (_, [, , query], res) => {
         const commands = [...this.commands.values()].filter(e => e.name.includes(query));

         if (commands) {
            res.push(...commands);
         }
      });

      after('unbound-commands', CommandsStore, 'getApplicationCommandSectionName', (_, [section], res) => {
         if (section.id === 'unbound') return 'Unbound';
      });

      after('unbound-commands', CommandUtils, 'useApplicationCommandsDiscoveryState', (_, [, , , isChat], res) => {
         if (isChat !== false) return res;

         if (!res.discoverySections.find(s => s.key == this.section.id) && this.commands.size) {
            const cmds = [...this.commands.values()];

            res.commands.push(...cmds.filter(cmd => !res.commands.some(e => e.name === cmd.name)));
            res.sectionsOffset.push(this.commands.size);
            res.discoveryCommands.push(...cmds);
            res.discoverySections.push({
               data: cmds,
               key: this.section.id,
               section: this.section
            });
         }

         if (!res.applicationCommandSections.find(s => s.id == this.section.id)) {
            res.applicationCommandSections.push(this.section);
         }


         const index = res.discoverySections.findIndex(e => e.key === '-2');
         if (res.discoverySections[index]?.data) {
            const section = res.discoverySections[index];
            section.data = section.data.filter(c => !c.__unbound);

            if (section.data.length == 0) res.discoverySections.splice(index, 1);
         }
      });
   };

   stop() {
      unpatchAll('unbound-commands');
   }

   register(options) {
      const { command, executor, ...cmd } = options;

      this.commands.set(command, {
         type: 3,
         target: 1,
         id: command,
         name: command,
         applicationId: this.section.id,
         options: [
            {
               type: 3,
               required: false,
               description: `Usage: ${cmd.usage?.replace?.(/{c}/g, command) ?? command}`,
               name: 'args'
            }
         ],
         __unbound: true,
         execute: async (result) => {
            try {
               this.handle(options, Object.values(result).map((e) => e.value) ?? []);
            } catch (error) {
               this.logger.error(error);
            }
         },
         ...cmd
      });
   }

   async handle(options, args) {
      const { command, executor } = options;

      try {
         const channel = Channels.getChannelId();

         const res = await executor(args);

         if (!res || !res.result) return;

         if (!res.send) {
            const options = { embeds: [] };

            if (typeof res.result === 'string') {
               options.content = res.result;
            } else {
               options.embeds.push(res.result);
            }

            send(channel, options);
         } else {
            Messages.sendMessage(channel, {
               content: res.result,
               invalidEmojis: [],
               validNonShortcutEmojis: [],
               tts: false
            });
         };
      } catch (error) {
         this.logger.error(`Could not executor for ${options.command}-${command}:`, error);

         send(void 0, {
            content: ":x: An error occurred while running this command. Check your console."
         });
      }
   }

   unregister(id) {
      this.commands.delete(id);
   };
};