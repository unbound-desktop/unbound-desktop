const { React, Constants: { DEFAULT_ROLE_COLOR, ROLE_COLORS } } = require('@webpack/common');
const { findInReactTree, memoize } = require('@utilities');
const { createLogger } = require('@modules/logger');
const { getByProps } = require('@webpack');

const SettingsItem = require('./SettingsItem');
const AsyncComponent = require('../AsyncComponent');

const Logger = createLogger('Components', 'ColorPicker');

const getColorPicker = memoize(async () => {
   try {
      const FormItems = getByProps('ColorPickerFormItem');
      if (!FormItems?.ColorPickerFormItem) {
         throw 'ColorPickerFormItem was not found!';
      }

      const rendered = FormItems.ColorPickerFormItem({ role: { color: 1 } });
      const ColorPicker = findInReactTree(rendered, (n) => n.props?.defaultColor).type;

      const Payload = await ColorPicker().props.children.type;
      const mdl = await (Payload._ctor || Payload._payload._result)();

      return mdl.default;
   } catch (error) {
      Logger.error('Failed to get ColorPicker component!', error);
      return () => null;
   }
});

const Picker = AsyncComponent.from(getColorPicker);

module.exports = class ColorPicker extends React.PureComponent {
   render() {
      const { title, description, required, default: defaultValue, defaultColors = ROLE_COLORS, value, disabled, onChange } = this.props;
      const children = this.props.children;
      delete this.props.children;

      return (
         <SettingsItem
            title={title}
            description={description}
            required={required}
            hasMargin={true}
         >
            <Picker
               colors={defaultColors}
               defaultColor={typeof defaultValue === 'number' ? defaultValue : DEFAULT_ROLE_COLOR}
               {...this.props}
            />
            {children}
         </SettingsItem>
      );
   }
};