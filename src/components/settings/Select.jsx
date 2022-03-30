const { getByDisplayName } = require('@webpack');
const { React } = require('@webpack/common');

const SelectWrapper = getByDisplayName('SelectTempWrapper');
const SettingsItem = require('./SettingsItem');

module.exports = class TextInput extends React.PureComponent {
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
            <SelectWrapper {...this.props} />
            {children}
         </SettingsItem>
      );
   }
};