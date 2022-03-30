const { Flex, FormItem, FormText, Divider } = require('@components');
const { classnames } = require('@utilities/');
const { React } = require('@webpack/common');
const { getByProps } = require('@webpack');

const { description } = getByProps('formText', 'description') || {};

module.exports = class SettingsItem extends React.PureComponent {
   render() {
      return (<>
         <FormItem
            title={this.props.title}
            required={this.props.required}
            className={[
               this.props.className,
               Flex.Direction.VERTICAL,
               Flex.Justify.START,
               Flex.Align.STRETCH,
               Flex.Wrap.NO_WRAP,
               'unbound-settings-item-form'
            ].join(' ')}
         >
            {this.props.children}
            {this.props.description && (
               <FormText
                  className={classnames(
                     description,
                     'unbound-settings-item-text'
                  )}
               >
                  {this.props.description}
               </FormText>
            )}
         </FormItem>
         <Divider className='unbound-settings-item-divider' />
      </>);
   }
};