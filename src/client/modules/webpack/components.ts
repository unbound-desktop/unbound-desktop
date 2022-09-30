import { find, findByDisplayName, findByProps, findByPrototypes, findByStrings } from '@webpack';

const cache: Record<string, any> = {
   Button: findByProps('Colors'),
   Text: find(m => m.Colors?.MUTED),
   SearchBar: find(m => m.Sizes),
   RelativeTooltip: findByPrototypes('renderTooltip'),
   Tooltip: Object.values(findByPrototypes('renderTooltip', { raw: true })).find(e => ~e.toString().indexOf('getOwnPropertySymbols')),
   Popout: findByProps('Positions', 'Animation'),
   FormTitle: findByProps('Tags', 'Sizes'),
   Flex: find(m => m.Direction?.VERTICAL),
   FormItem: ({ children }) => children,
   Switch: () => null,
   Menu: {},
   get FormText() {
      return this.Text;
   },
   Caret: findByProps('Directions', { all: true })[2],
   Typography: Object.assign(findByStrings('data-text-variant'), {
      Variants: findByProps('display-lg'),
      Classes: findByProps('defaultMarginh1')
   })
};

export = new Proxy<typeof cache>(cache, {
   get(_, prop: string) {
      if (!cache[prop]) {
         const name = prop.toString().replace('Raw', '');
         const interop = !prop.toString().startsWith('Raw') ?? true;

         cache[prop] ??= findByDisplayName(name, { interop });
      }

      return cache[prop];
   }
});