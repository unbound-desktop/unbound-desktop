const API = require('@structures/api');

const { after, unpatchAll } = require('@patcher');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const { avatar } = require('@constants');
const { send } = require('@api/clyde');

const [
   Channels,
   Messages
] = getByProps(
   ['getLastSelectedChannelId'],
   ['sendMessage'],
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
         icon: '__UNBOUND__'
      };

      bindAll(this, ['register', 'unregister']);
   }

   start() {
      const [AssetUtils, CommandUtils, Commands] = getByProps(
         ['getApplicationIconURL'],
         ['useApplicationCommandsDiscoveryState'],
         ['getBuiltInCommands'],
         { bulk: true }
      );

      after('unbound-commands', AssetUtils, 'getApplicationIconURL', (_, [props]) => {
         if (props.icon === '__UNBOUND__') return avatar;
      });

      after('unbound-commands', Commands, 'getBuiltInCommands', (_, [, , isChat], res) => {
         if (isChat !== false) return res;

         return [...res, ...this.commands.values()];
      });

      after('unbound-commands', CommandUtils, 'useApplicationCommandsDiscoveryState', (_, [, , , isChat], res) => {
         if (isChat !== false) return res;

         if (!res.discoverySections.find(d => d.key == this.section.id) && this.commands.size) {
            const cmds = [...this.commands.values()];

            res.applicationCommandSections.push(this.section);
            res.discoveryCommands.push(...cmds);
            res.commands.push(...cmds.filter(cmd => !res.commands.some(e => e.name === cmd.name)));

            res.discoverySections.push({
               data: cmds,
               key: this.section.id,
               section: this.section
            });

            res.sectionsOffset.push(this.commands.size);
         }

         const index = res.discoverySections.findIndex(e => e.key === '-2');
         if (res.discoverySections[index]?.data) {
            const section = res.discoverySections[index];
            section.data = section.data.filter(c => !c.__unbound);

            if (section.data.length == 0) res.discoverySections.splice(index, 1);
         }
      });
   }

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
      commands.delete(id);
   };
};