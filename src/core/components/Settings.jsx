const { React } = require('@webpack/common');

const { Text, ErrorBoundary, Category, FormTitle, Icon, Switch } = require('@components');
const Icons = require('./icons');

class Settings extends React.PureComponent {
   constructor() {
      super();

      this.state = {};
   }

   renderSwitch(options) {
      const {
         name,
         id,
         reload = false,
         restart = false,
         onChange = () => { },
         default: defaultValue = false,
      } = options;

      return <div className='unbound-settings-category-switch'>
         <Text className='unbound-settings-categry-switch-text' size={Text.Sizes.SIZE_16}>
            {name}
         </Text>
         <Switch
            className='unbound-settings-category-inner-switch'
            checked={id && this.props.get(id, defaultValue)}
            onChange={(v) => {
               if (!id) return;
               this.props.set(id, v);

               typeof onChange === 'function' && onChange(v);

               if (reload) {
                  window.location.reload();
               } else if (restart) {
                  DiscordNative.remoteApp.relaunch();
               }
            }}
         />
      </div>;
   }

   render() {
      const {
         isGeneralOpen = false,
         isDeveloperOpen = false,
         isPowercordOpen = false,
         isBdOpen = false
      } = this.state;

      return (
         <ErrorBoundary>
            <FormTitle tag='h1' className='unbound-settings-title'>
               Settings
            </FormTitle>
            <Category
               title='General Settings'
               description='Settings strictly related to Unbound'
               icon={() => <Icon name='Gear' className='unbound-category-icon' />}
               opened={isGeneralOpen}
               onChange={() => this.setState({ isGeneralOpen: !isGeneralOpen })}
            >
               {this.renderSwitch({ name: 'Hi' })}
               {this.renderSwitch({ name: 'Hi' })}
               {this.renderSwitch({ name: 'Hi' })}
            </Category>

            <Category
               title='Developer Settings'
               description='Settings strictly related to Unbound'
               icon={() => <Icon name='InlineCode' className='unbound-category-icon' />}
               opened={isDeveloperOpen}
               onChange={() => this.setState({ isDeveloperOpen: !isDeveloperOpen })}
            >
               {this.renderSwitch({
                  name: 'F8 DevTools Debugger Keybind',
                  id: 'debuggerKeybind',
                  default: false,
                  onChange: (enabled) => {
                     if (enabled) {
                        console.log('hi');
                     } else {

                     }
                  }
               })}
            </Category>

            {/* window.powercord && */
               <Category
                  title='Powercord Settings'
                  description='Settings strictly related to Powercord'
                  icon={() => <Icons.Plug className='unbound-category-icon' />}
                  opened={isPowercordOpen}
                  onChange={() => this.setState({ isPowercordOpen: !isPowercordOpen })}
               >
                  soon
               </Category>
            }

            {/* window.powercord && */
               <Category
                  title='BetterDiscord Settings'
                  description='Settings strictly related to BetterDiscord'
                  icon={() => <Icons.Bd className='unbound-category-icon' />}
                  opened={isBdOpen}
                  onChange={() => this.setState({ isBdOpen: !isBdOpen })}
               >
                  soon
               </Category>
            }
         </ErrorBoundary>
      );
   }
};

module.exports = unbound.apis.settings.connectStores('unbound-general-settings')(Settings);