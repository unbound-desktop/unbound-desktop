import { Icons } from '@core/components';
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
      return <Icons.Bd {...this.props} />;
      // return null;
      // if (!this.props.name) return null;

      // const Icon = cache.components[this.props.name] ?? findByDisplayName(this.props.name);
      // if (Icon) cache.components[this.props.name] ??= Icon;
      // // @ts-expect-error
      // delete this.props.name;

      // return <Icon {...this.props} />;
   }
};

export = Icon;