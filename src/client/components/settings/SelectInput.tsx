import { SelectInput as Select } from '@components/discord';
import React from 'react';

import SettingsItem, { SettingsItemProps } from './SettingsItem';

export default class SelectInput extends React.PureComponent<SettingsItemProps> {
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
        <Select {...this.props} />
        {children as JSX.Element}
      </SettingsItem>
    );
  }
};