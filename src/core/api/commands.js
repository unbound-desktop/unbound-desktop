const API = require('@structures/api');

const { getByProps, getByDisplayName } = require('@webpack');
const { bindAll, findInReactTree } = require('@utilities');
const { avatar } = require('@constants');
const { create } = require('@patcher');
const { send } = require('@api/clyde');

const Patcher = create('unbound-commands');

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
      const CommandsIcon = getByDisplayName('ApplicationCommandDiscoveryApplicationIcon', { default: false });
      Patcher.after(CommandsIcon, 'default', (_, [props], res) => {
         if (props.section.id === this.section.id) {
            const img = findInReactTree(res, r => r.props.src);
            img.props.src = this.section.icon;
         }
      });

      Patcher.after(AssetUtils, 'getApplicationIconURL', (_, [section]) => {
         if (section.id === this.section.id) {
            return this.section.icon;
         }
      });

      Patcher.after(CommandsStore, 'queryCommands', (_, [, , query], res) => {
         const commands = [...this.commands.values()].filter(e => e.name.includes(query));
         res.push(...commands);
      });

      Patcher.after(CommandsStore, 'getApplicationCommandSectionName', (_, [section], res) => {
         if (section.id === this.section.id) {
            return this.section.name;
         }
      });

      Patcher.after(CommandUtils, 'useApplicationCommandsDiscoveryState', (_, [, , , isChat], res) => {
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

         if (!res.applicationCommandSections.find(s => s.id == this.section.id) && this.commands.size) {
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
      Patcher.unpatchAll();
   }

   register(options) {
      const { command, executor, ...cmd } = options;

      this.commands.set(command, {
         type: 3,
         target: 1,
         id: command,
         name: command,
         applicationId: this.section.id,
         options: [],
         __unbound: true,
         execute: () => {},
         ...cmd
      });
   }

   unregister(id) {
      this.commands.delete(id);
   };
};
