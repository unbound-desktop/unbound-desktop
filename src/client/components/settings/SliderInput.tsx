import { Slider } from '@components/discord';
import { classnames } from '@utilities';
import React from 'react';

import SettingsItem, { SettingsItemProps } from './SettingsItem';

import Styles from '@styles/components/sliderinput.css';
Styles.append();

interface SliderInputProps extends SettingsItemProps {
  fillStyles?: Record<any, any>;
  stickToMarkers?: boolean;
  initialValue?: number;
  keyboardStep?: number;
  defaultValue?: number;
  handleSize?: number;
  markers?: number[];
  disabled?: boolean;
  onValueChange?: Fn;
  onValueRender?: Fn;
  [key: string]: any;
  maxValue?: number;
  minValue?: number;
}

export default class SliderInput extends React.PureComponent<SliderInputProps> {
  render() {
    const { title, description, required, markers, ...rest } = this.props;
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
        <Slider
          {...this.props}
          className={classnames(
            this.props.className,
            'unbound-settings-slider',
            markers && 'unbound-settings-slider-has-markers'
          )}
        />
        {children as JSX.Element}
      </SettingsItem>
    );
  }
};