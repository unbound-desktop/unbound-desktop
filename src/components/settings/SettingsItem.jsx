const { Flex, FormItem, FormText, Divider } = require('@components');
const { classnames } = require('@utilities/');
const { React } = require('@webpack/common');
const { findByProps } = require('@webpack');

const Classes = findByProps('formText', 'description') || {};

module.exports = class SettingsItem extends React.PureComponent {
   render() {
      const { className, title, required, endDivider = true, children, description } = this.props;

      return (<>
         <FormItem
            title={title}
            required={required}
            className={[
               className,
               Flex.Direction.VERTICAL,
               Flex.Justify.START,
               Flex.Align.STRETCH,
               Flex.Wrap.NO_WRAP,
               'unbound-settings-item-form'
            ].join(' ')}
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
         {endDivider && <Divider className='unbound-settings-item-divider' />}
      </>);
   }
};