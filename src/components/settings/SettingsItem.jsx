const { Flex, FormItem, FormText, Divider } = require('@components');
const { bulk, filters } = require('@webpack');
const { React } = require('@webpack/common');

const [
   { marginTop8, marginBottom20 } = {},
   { description } = {}
] = bulk(
   filters.byProps('marginSmall'),
   filters.byProps('formText', 'description')
);

module.exports = class SettingsItem extends React.PureComponent {
   render() {
      const hasMargin = this.props.hasMargin && marginTop8;
      return (
         <FormItem
            title={this.props.title}
            required={this.props.required}
            className={[
               Flex.Direction.VERTICAL,
               Flex.Justify.START,
               Flex.Align.STRETCH,
               Flex.Wrap.NO_WRAP,
               marginBottom20
            ].join(' ')}
         >
            {this.props.children}
            {this.props.description && (
               <FormText className={[description, hasMargin].filter(Boolean).join(' ')}>
                  {this.props.description}
               </FormText>
            )}
            <Divider />
         </FormItem>
      );
   }
};