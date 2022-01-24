const components = require('@data/components');
const { bulk, filters } = require('@webpack');

const search = [];
Object.keys(components).map(name => {
   const options = components[name];
   let filter;
   let map;

   if (options.name) {
      filter = filters.byDisplayName(options.name);
   } else if (Array.isArray(options.props)) {
      if (options.type == 'MERGE') {
         const found = [];

         filter = (m) => {
            const matches = options.props.some((props) => props.every(p => m[p]));
            if (matches) found.push(m);

            return matches;
         };

         map = () => ({ ...found });
      } else {
         filter = filters.byProps(...options.props);
         if (typeof options.prop == 'string') {
            map = (m) => m[options.prop];
         }
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

   if (filter) search.push({ filter, name, map });
});

const res = bulk(...search.map(s => s.filter));
search.map(({ name, map }, index) => {
   const mapper = map ?? (m => m);
   const result = mapper(res[index]);

   exports[name] = result;
});

require('fs')
   .readdirSync(__dirname)
   .filter(file => file !== require('path').basename(__filename)).map(file => {
      const items = file.split('.');
      items.splice(items.length - 1, 1);

      module.exports[items.join('.')] = require(`${__dirname}/${file}`);
   });