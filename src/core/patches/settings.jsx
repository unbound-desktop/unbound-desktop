const { getByDisplayName } = require('@webpack');
const { React } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { after } = require('@patcher');

console.log(require('@core/components'));
const { Settings, Manager } = require('@core/components');

console.log(Settings, Manager);
const SettingsView = getByDisplayName('SettingsView');
after('unbound-settings', SettingsView.prototype, 'getPredicateSections', (_, args, sections) => {
   const changelog = sections.find(c => c.section === 'changelog');
   if (changelog) {
      const managers = Object.keys(unbound.managers).map(capitalize);

      sections.splice(
         sections.indexOf(changelog), 0,
         {
            section: 'HEADER',
            label: 'Unbound'
         },
         {
            section: 'unbound',
            label: 'Settings',
            element: Settings
         },
         ...managers.map(m => ({ 
            section: m,
            label: m,
            element: () => <Manager type={m} />
         })),
         { section: 'DIVIDER' }
      );
   }
});