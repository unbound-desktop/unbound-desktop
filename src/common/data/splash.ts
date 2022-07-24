const modules = {
   React: {
      props: ['createElement', 'Component'],
   },
   ReactDOM: {
      props: ['hydrate', 'findDOMNode']
   }
};

// @ts-ignore
export = modules;
export type Common = keyof typeof modules;