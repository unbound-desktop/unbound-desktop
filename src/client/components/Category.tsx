import { FormTitle, FormText, Caret, Text } from '@components/discord';
import { classnames } from '@utilities';
import React from 'react';

import Divider from './Divider';
import Icon from './Icon';

import Styles from '@styles/components/category.css';
Styles.append();

interface CategoryProps {
  icon?: string | CallableFunction;
  onChange?: (...args) => any;
  description?: string;
  endDivider?: boolean;
  className?: string;
  opened?: boolean;
  children?: any;
  title?: string;
  [key: string]: any;
}

class Category extends React.PureComponent<CategoryProps> {
  render() {
    const { title, description, opened, onChange, children, icon, className, endDivider } = this.props;

    return <div className={classnames(className, 'unbound-category', opened && 'unbound-category-opened')}>
      <div
        className={classnames('unbound-category-header', icon && 'unbound-category-has-icon')}
        onClick={onChange}
      >
        {
          typeof icon === 'function' && icon({ className: 'unbound-category-icon' }) ||
          typeof icon === 'string' && <Icon className='unbound-category-icon' name={icon} />
        }
        <div className='unbound-category-details'>
          <FormTitle
            color={Text.Colors.HEADER_PRIMARY}
            tag={FormTitle.Tags.H3}
            size={Text.Sizes.SIZE_16}
            className={classnames('unbound-category-details-title', !description && 'unbound-category-details-title-no-description')}
          >
            {title}
          </FormTitle>
          {description && <FormText
            color={Text.Colors.HEADER_SECONDARY}
            size={Text.Sizes.SIZE_14}
            className='unbound-category-details-description'
          >
            {description}
          </FormText>}
        </div>
        <Caret
          direction={opened ? Caret.Directions.DOWN : Caret.Directions.RIGHT}
          className='unbound-category-caret'
        />
      </div>
      {opened && <Divider className='unbound-category-divider' />}
      <div
        data-is-open={opened}
        className={classnames('unbound-category-content', opened && 'unbound-margin-top-20')}
      >
        {opened && <>
          {children}
        </>}
      </div>
      {opened && endDivider && <Divider className='unbound-category-divider' />}
    </div>;
  }
};

export = Category;