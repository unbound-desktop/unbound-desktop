const { classnames } = require('@utilities');
const { React } = require('@webpack/common');
const { Slider } = require('@components');

const SettingsItem = require('./SettingsItem');

module.exports = class SliderInput extends React.PureComponent {
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
            <Slider
               {...this.props}
               className={classnames(this.props.className, 'unbound-settings-slider')}
            />
            {children}
         </SettingsItem>
      );
   }
};