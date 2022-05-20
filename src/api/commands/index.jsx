const API = require('@structures/api');

const { bindAll, classnames } = require('@utilities');
const { bulk, filters } = require('@webpack');
const { avatar } = require('@constants');
const { create } = require('@patcher');
const React = require('react');

const Patcher = create('unbound-commands');

const [
   CommandsStore,
   Icons,
   SearchStore,
   Classes,
   SectionIcon,
] = bulk(
   filters.byProps('getBuiltInCommands'),
   filters.byProps('getApplicationIconURL'),
   filters.byProps('useSearchManager'),
   filters.byProps('icon', 'selectable', 'wrapper'),
   filters.byDisplayName('ApplicationCommandDiscoverySectionIcon', false),
);

const Icon = require('./components/SectionIcon');

class CommandsAPI extends API {
   constructor() {
      super();

      this.commands = new Map();
      this.section = {
         id: 'unbound',
         type: 0,
         name: 'Unbound',
         icon: avatar
      };

      bindAll(this, ['register', 'unregister']);
   }

   start() {
      Patcher.instead(SectionIcon, 'default', (self, args, orig) => {
         const [props] = args;
         const isSmall = props.selectable === void 0;

         if (props.section.id === this.section.id) {
            const metadata = classnames(Classes.wrapper, props.selectable && Classes.selectable, props.selectable && props.isSelected && Classes.selected);

            return (
               <div className={metadata}>
                  <Icon
                     width={props.width}
                     height={props.height}
                     className={classnames(Classes.icon, props.className)}
                     style={{
                        width: `${props.width}px`,
                        height: `${props.height}px`,
                        padding: !isSmall ? '4px' : 0,
                        paddingBottom: !isSmall ? '1px' : 0
                     }}
                  />
               </div>
            );
         }

         return orig.apply(self, args);
      });

      CommandsStore.BUILT_IN_SECTIONS['unbound'] = this.section;
      Patcher.instead(Icons, 'getApplicationIconURL', (self, args, orig) => {
         if (args[0]?.id === this.section.id) {
            return this.section.icon;
         }

         return orig.apply(self, args);
      });

      Patcher.after(SearchStore.default, 'getApplicationSections', (_, args, res) => {
         res ??= [];

         if (!res.find(r => r.id === this.section.id)) {
            res.push(this.section);
         };
      });

      Patcher.after(SearchStore.default, 'getQueryCommands', (_, [, , query], res) => {
         if (!query || query.startsWith('/')) return;
         res ??= [];

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


      Patcher.after(SearchStore, 'useSearchManager', (_, [, type, a, b, c], res) => {
         if (type !== 1) return;

         if (!res.sectionDescriptors?.find?.(s => s.id === this.section.id)) {
            res.sectionDescriptors ??= [];
            res.sectionDescriptors.push(this.section);
         }

         if ((!res.filteredSectionId || res.filteredSectionId === this.section.id) && !res.activeSections.find(s => s.id === this.section.id)) {
            res.activeSections.push(this.section);
         }

         const commands = [...this.commands.values()];
         if (commands.some(c => !res.commands?.find?.(r => r.id === c.id))) {
            res.commands ??= [];

            // De-duplicate commands
            const collection = [...res.commands, ...commands];
            res.commands = [...new Set(collection).values()];
         }

         if ((!res.filteredSectionId || res.filteredSectionId === this.section.id) && !res.commandsByActiveSection.find(r => r.section.id === this.section.id)) {
            res.commandsByActiveSection.push({
               section: this.section,
               data: [...this.commands.values()]
            });
         }

         const active = res.commandsByActiveSection.find(r => r.section.id === this.section.id);
         if ((!res.filteredSectionId || res.filteredSectionId === this.section.id) && active && active.data.length === 0 && this.commands.size !== 0) {
            active.data = [...this.commands.values()];
         }

         /*
          * Filter out duplicate built-in sections due to a bug that causes
          * the getApplicationSections path to add another built-in commands
          * section to the section rail
          */

         const builtIn = res.sectionDescriptors.filter(s => s.id === '-1');
         if (builtIn.length > 1) {
            res.sectionDescriptors = res.sectionDescriptors.filter(s => s.id !== '-1');
            res.sectionDescriptors.push(builtIn.find(r => r.id === '-1'));
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
         listed: true,
         dmPermission: true,
         execute: () => { },
         ...cmd
      });
   }

   unregister(id) {
      this.commands.delete(id);
   };
};

module.exports = new CommandsAPI();