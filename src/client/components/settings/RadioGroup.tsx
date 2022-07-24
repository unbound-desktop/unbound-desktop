import { RadioGroup as Radio } from '@components/discord';
import React from 'react';

import SettingsItem, { SettingsItemProps } from './SettingsItem';

export default class RadioGroup extends React.PureComponent<SettingsItemProps> {
   render() {
      const { title, description, required, ...rest } = this.props;
      const children = this.props.children;

      // @ts-ignore
      delete this.props.children;

      return (
         <SettingsItem
            title={title}
            description={description}
            required={required}
            {...rest}
         >
            <Radio {...this.props} />
            {children as JSX.Element}
         </SettingsItem>
      );
   }
};