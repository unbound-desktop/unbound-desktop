const { TextInput: Input } = require('@components');
const { React } = require('@webpack/common');

const SettingsItem = require('./SettingsItem');

module.exports = class TextInput extends React.PureComponent {
   render() {
      const { title, description, required, ...rest } = this.props;
      const children = this.props.children;
      delete this.props.children;

      return (
         <SettingsItem
            title={title}
            description={description}
            required={required}
            {...rest}
         >
            <Input {...this.props} />
            {children}
         </SettingsItem>
      );
   }
};