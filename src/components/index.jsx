const components = require('@data/components');
const { bulk, filters } = require('@webpack');
const { readdirSync } = require('fs');
const { basename } = require('path');

const search = [];
Object.keys(components).map(name => {
   const options = components[name];
   let filter;
   let map;

   if (options.name) {
      const byDefaultDisplayName = (m => m.default?.displayName === options.name);
      const isDefault = options.default ?? true;

      filter = isDefault ? filters.byDisplayName(options.name) : byDefaultDisplayName;
   } else if (Array.isArray(options.props)) {
      filter = filters.byProps(...options.props);
      if (typeof options.prop == 'string') {
         map = (m) => m[options.prop];
      }
   }

   if (options.assign) {
      const current = map ?? (m => m);
      map = (mod) => {
         mod = current(mod);
         const cloned = { ...mod };

         for (const [from, to] of Object.entries(options.assign)) {
            cloned[to] = mod[from];
         }

         return cloned;
      };
   }

   if (filter) search.push({ filter, name, map, default: options.default ?? false });
});

const res = bulk(...search.map(s => s.filter));
search.map(({ name, map }, index) => {
   const mapper = map ?? (m => m);
   const result = mapper(res[index]);

   exports[name] = result;
});

readdirSync(__dirname).filter(f => f !== basename(__filename)).map(file => {
   const items = file.split('.');
   if (items.length != 1) items.splice(items.length - 1, 1);

   module.exports[items.join('.')] = require(`${__dirname}/${file}`);
});