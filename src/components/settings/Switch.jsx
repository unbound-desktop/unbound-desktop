const { Switch: SwitchItem } = require('@components');
const { React } = require('@webpack/common');

const SettingsItem = require('./SettingsItem');

module.exports = class Switch extends React.PureComponent {
   render() {
      const { title, description, required } = this.props;
      delete this.props.children;

      return (
         <SettingsItem
            description={description}
            required={required}
            hasMargin={true}
         >
            <div className='unbound-settings-switch-container'>
               <div className='unbound-settings-switch-title'>
                  {title}
               </div>
               <SwitchItem {...this.props} />
            </div>
         </SettingsItem>
      );
   }
};