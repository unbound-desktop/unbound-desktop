const { SelectInput } = require('@components');
const { React } = require('@webpack/common');

const SettingsItem = require('./SettingsItem');

module.exports = class Select extends React.PureComponent {
   render() {
      const { title, description, required } = this.props;
      const children = this.props.children;
      delete this.props.children;

      return (
         <SettingsItem
            title={title}
            description={description}
            required={required}
            hasMargin={true}
         >
            <SelectInput {...this.props} />
            {children}
         </SettingsItem>
      );
   }
};