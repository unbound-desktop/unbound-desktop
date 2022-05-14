const { FormTitle, FormText, Caret, Text } = require('@components');
const { React } = require('@webpack/common');
const { classnames } = require('@utilities');
const Divider = require('./Divider');

module.exports = class Category extends React.PureComponent {
   render() {
      const { title, description, opened, onChange, children, icon, className, endDivider } = this.props;

      return <div className={classnames('unbound-category', opened && 'unbound-category-opened', className)}>
         <div
            className={classnames('unbound-category-header', icon && 'unbound-category-has-icon')}
            onClick={onChange}
         >
            {typeof icon === 'function' && icon({ className: 'unbound-category-icon' })}
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