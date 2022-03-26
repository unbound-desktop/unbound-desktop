const { FormTitle, FormText, Caret, Text, Divider } = require('@components');
const { React } = require('@webpack/common');
const { classnames } = require('@utilities');

module.exports = class Category extends React.PureComponent {
   render() {
      const { title, description, opened, onChange, children, icon } = this.props;

      return <div className={classnames('unbound-category', opened && 'unbound-category-opened')}>
         <div
            className={classnames('unbound-category-header', icon && 'unbound-category-has-icon')}
            onClick={onChange}
         >
            {typeof icon === 'function' && icon()}
            <div className='unbound-category-details'>
               <FormTitle
                  color={Text.Colors.HEADER_PRIMARY}
                  tag={FormTitle.Tags.H3}
                  size={Text.Sizes.SIZE_16}
                  className='unbound-category-details-title'
               >
                  {title}
               </FormTitle>
               <FormText
                  color={Text.Colors.HEADER_SECONDARY}
                  size={Text.Sizes.SIZE_14}
                  className='unbound-category-details-description'
               >
                  {description}
               </FormText>
            </div>
            <Caret
               direction={opened ? Caret.Directions.DOWN : Caret.Directions.RIGHT}
               className='unbound-category-caret'
            />
         </div>
         {opened && <Divider className='unbound-category-divider' />}
         <div
            className={classnames('unbound-category-content', opened && 'unbound-margin-top-20')}
         >
            {opened && children}
         </div>
      </div>;
   }
};