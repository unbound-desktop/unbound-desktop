import { Switch as SwitchItem } from '@components/discord';
import React from 'react';

import SettingsItem, { SettingsItemProps } from './SettingsItem';

import Styles from '@styles/components/switch.css';
Styles.append();

interface SwitchProps extends SettingsItemProps {
  checked?: boolean;
  onChange?: Fn;
  [key: string]: any;
}

export default class Switch extends React.PureComponent<SwitchProps> {
  render() {
    const { title, description, required, ...rest } = this.props;

    // @ts-ignore
    delete this.props.children;

    return (
      <SettingsItem
        description={description}
        required={required}
        {...rest}
      >
        <div className='unbound-settings-switch-container'>
          <div className='unbound-settings-switch-title'>
            {title}
          </div>
          <SwitchItem {...this.props} />
        </div>
      </SettingsItem>
    );
  }
};