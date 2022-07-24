import { Flex, FormItem, FormText } from '@components/discord';
import { classnames } from '@utilities';
import { findByProps } from '@webpack';
import Divider from '../Divider';
import React from 'react';

import Styles from '@styles/components/settings-item.css';
Styles.append();

const Classes = findByProps('formText', 'description') || {};

export interface SettingsItemProps {
   children?: JSX.Element | JSX.Element[];
   bottomMargin?: number;
   endDivider?: boolean;
   description?: string;
   className?: string;
   required?: boolean;
   title?: string;

   [key: string]: any;
}

export default class SettingsItem extends React.PureComponent<SettingsItemProps, {}> {
   render() {
      const { bottomMargin = 15, className, title, required, endDivider = true, children, description, ...rest } = this.props;

      return (<>
         <FormItem
            {...rest}
            title={title}
            required={required}
            className={[
               className,
               Flex.Direction.VERTICAL,
               Flex.Justify.START,
               Flex.Align.STRETCH,
               Flex.Wrap.NO_WRAP,
               'unbound-settings-item-form'
            ].filter(Boolean).join(' ')}
         >
            {children}
            {description && (
               <FormText
                  className={classnames(
                     Classes.description,
                     'unbound-settings-item-text'
                  )}
               >
                  {description}
               </FormText>
            )}
         </FormItem>
         {endDivider ? <Divider
            style={{ marginTop: bottomMargin }}
            className='unbound-settings-item-divider'
         /> : <div
            style={{ marginTop: bottomMargin }}
            className='unbound-settings-item-divider invisible'
         />}
      </>);
   }
};