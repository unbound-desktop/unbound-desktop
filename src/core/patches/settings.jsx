const { getLazy, filters: { byDisplayName } } = require('@webpack');
const { after, unpatchAll } = require('@patcher');
const { React } = require('@webpack/common');
const { capitalize } = require('@utilities');
const Patch = require('@structures/patch');

const blacklisted = {
   labels: ['Powercord', 'BetterDiscord'],
   sections: ['pc-', 'bdcompat']
};

module.exports = class Settings extends Patch {
   async apply() {
      this.promises = { cancelled: false };

      const Components = require('@core/components');
      const SettingsView = await getLazy(byDisplayName('SettingsView'));

      if (this.promises.cancelled) return;
      after('unbound-settings', SettingsView.prototype, 'getPredicateSections', (_, args, sections) => {
         // Remove integrated settings views
         sections = sections.filter(s => {
            const index = sections.indexOf(s);
            if (s.section == 'DIVIDER' && sections[index + 1]?.label == 'BetterDiscord') {
               return false;
            }

            if (blacklisted.labels.includes(s.label)) {
               return false;
            }

            if (blacklisted.sections.some(e => s.section?.includes(e) || s.id?.includes(e))) {
               return false;
            }

            return true;
         });

         const changelog = sections.find(c => c.section === 'changelog');
         if (changelog) {
            sections.splice(
               sections.indexOf(changelog), 0,
               {
                  section: 'HEADER',
                  label: 'Unbound'
               },
               {
                  section: 'unbound',
                  label: 'Settings',
                  element: Components.Settings
               },
               ...Object.keys(unbound.managers).map(m => {
                  const Manager = unbound.managers[m];

                  return {
                     section: capitalize(m),
                     label: capitalize(m),
                     element: () => <Manager.panel type={m} />
                  };
               }),
               { section: 'DIVIDER' }
            );

            sections._splice = sections.splice;
            sections.splice = function (...args) {
               const items = args.slice(2);

               if (
                  items?.length &&
                  items.some(i => blacklisted.labels.some(l => i.label?.includes(l)))
               ) return sections;

               return sections._splice(...args);
            };

            return sections;
         }
      });
   }

   remove() {
      this.promises.cancelled = false;
      unpatchAll('unbound-settings');
   }
};