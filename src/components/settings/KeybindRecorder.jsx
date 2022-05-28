const { findLazy, filters } = require('@webpack');
const { React } = require('@webpack/common');
const { memoize } = require('@utilities');

const SettingsItem = require('./SettingsItem');
const AsyncComponent = require('../AsyncComponent');

const getKeybindRecorder = memoize(async () => {
   return await findLazy(filters.byDisplayName('KeybindRecorder'));
});

const KeyRecorder = AsyncComponent.from(getKeybindRecorder);

module.exports = class KeybindRecorder extends React.PureComponent {
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
            <KeyRecorder
               defaultValue={this.props.defaultValue ?? []}
               {...this.props}
            />
            {children}
         </SettingsItem>
      );
   }
};