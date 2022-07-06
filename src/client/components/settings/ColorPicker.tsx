import { findInReactTree, forceRender, classnames, memoize } from '@utilities';
import { createLogger } from '@common/logger';
import { findByDisplayName } from '@webpack';
import { Constants } from '@webpack/common';
import React from 'react';

import SettingsItem, { SettingsItemProps } from './SettingsItem';
import AsyncComponent from '../AsyncComponent';

import Styles from '@styles/components/colorpicker.css';
Styles.append();

const Logger = createLogger('Components', 'ColorPicker');

const getPicker = memoize(async () => {
  try {
    const GuildSettingsRolesEditDisplay = findByDisplayName('GuildSettingsRolesEditDisplay');
    if (!GuildSettingsRolesEditDisplay) {
      throw 'GuildSettingsRolesEditDisplay was not found!';
    }

    const Content = forceRender(() => new GuildSettingsRolesEditDisplay({ guild: { id: '' }, role: { id: '' } }))();
    const ColorPickerFormItem = findInReactTree(Content, r => r.type?.displayName === 'ColorPickerFormItem');
    const ColorPicker = ColorPickerFormItem.type({ role: { id: '' } });

    const loader = findInReactTree(ColorPicker, r => r.props?.defaultColor).type;
    const lazy = await loader().props.children.type;
    const mdl = await (lazy._ctor ?? lazy._payload._result)();

    return mdl.default as Fn;
  } catch (error) {
    Logger.error('Failed to get ColorPicker component!', error);
    return () => null;
  }
});

interface ColorPickerProps extends SettingsItemProps {
  default?: number;
  defaultColors?: number[];
  [key: string]: any;
}

export default class ColorPicker extends React.PureComponent<ColorPickerProps> {
  render() {
    const {
      className,
      title,
      description,
      required,
      default: defaultValue,
      defaultColors = Constants.ROLE_COLORS,
      ...rest
    } = this.props;

    const children = this.props.children;

    // @ts-ignore
    delete this.props.children;

    const Picker = AsyncComponent.from(getPicker);

    return (
      <SettingsItem
        title={title}
        description={description}
        required={required}
        {...rest}
      >
        <Picker
          colors={defaultColors}
          defaultColor={typeof defaultValue === 'number' ? defaultValue : Constants.DEFAULT_ROLE_COLOR}
          className={classnames('unbound-settings-color-picker', className)}
          {...this.props}
        />
        {children as JSX.Element}
      </SettingsItem>
    );
  }
};