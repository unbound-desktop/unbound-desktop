import { findByDisplayName, findByStrings } from '@webpack';
import React from 'react';

const cache = {
   components: {},
   webpack: null
};

interface IconProps {
   name: string;
   [key: string]: any;
}

class Icon extends React.PureComponent<IconProps> {
   render() {
      if (!this.props.name) return null;

      const Icon = cache.components[this.props.name] ?? findByDisplayName(this.props.name);
      if (Icon) cache.components[this.props.name] ??= Icon;
      // @ts-expect-error
      delete this.props.name;

      return <Icon {...this.props} />;
   }

   static get Names() {
      if (!cache.webpack) {
         cache.webpack = findByStrings('"currentColor"', { all: true });

         for (let i = 0; i < cache.webpack?.length; i++) {
            const mdl = cache.webpack[i];
            if (!mdl.displayName) continue;
            cache.components[mdl.displayName] ??= mdl;
         }
      }

      return cache.webpack.map(m => m.displayName).filter(Boolean);
   }
};

export = Icon;