const { getLazy, filters } = require('@webpack');
const { React } = require('@webpack/common');
const { memoize } = require('@utilities');
const { strings } = require('@api/i18n');

const { Text, ErrorBoundary, Category, FormTitle, Icon, Switch, AsyncComponent } = require('@components');
const Settings = require('@api/settings');
const Toasts = require('@api/toasts');
const Icons = require('./Icons');

const NotificationSettings = memoize(() => getLazy(filters.byDisplayName('NotificationSettings')));
const BoundSelector = AsyncComponent.from(NotificationSettings);

class GeneralSettings extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = {};

      this.settings = props.settings;
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
         <Text className='unbound-settings-category-switch-text' size={Text.Sizes.SIZE_16}>
            {name}
         </Text>
         <Switch
            className='unbound-settings-category-inner-switch'
            checked={id && this.settings.get(id, defaultValue)}
            onChange={(v) => {
               if (!id) return;
               this.settings.set(id, v);

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

      const BDSettings = window.BDInternal?.SettingsManager;

      return (
         <ErrorBoundary>
            <FormTitle tag='h1' className='unbound-settings-title'>
               Settings
            </FormTitle>
            <Category
               title={strings.TOAST_SETTINGS_TITLE}
               description={strings.TOAST_SETTINGS_DESCRIPTION}
               icon={p => <Icon name='ChatBubble' {...p} />}
               opened={isGeneralOpen}
               onChange={() => this.setState({ isGeneralOpen: !isGeneralOpen })}
            >
               <BoundSelector
                  position={this.parsePosition(this.settings.get('toastPosition', 'bottom-right'))}
                  onChange={(e, v) => {
                     const position = this.parsePosition(v);
                     this.settings.set('toastPosition', position);

                     this.toasts ??= [];
                     if (this.toasts.length) {
                        for (const toast of this.toasts) {
                           Toasts.close(toast);
                        }
                     }

                     if (position === 'disabled') {
                        Toasts.clear();
                     }

                     this.toasts.push(Toasts.open({
                        title: strings.TOAST_EXAMPLE_TITLE,
                        color: 'var(--info-positive-foreground)',
                        icon: 'CheckmarkCircle',
                        content: strings.TOAST_EXAMPLE_CONTENT,
                        timeout: 1000
                     }));
                  }}
               />
            </Category>

            <Category
               title={strings.DEVELOPER_SETTINGS_TITLE}
               description={strings.DEVELOPER_SETTINGS_DESCRIPTION}
               icon={() => <Icon name='InlineCode' className='unbound-category-icon' />}
               opened={isDeveloperOpen}
               onChange={() => this.setState({ isDeveloperOpen: !isDeveloperOpen })}
            >

            </Category>

            {BDSettings && <Category
               title={strings.BD_SETTINGS_TITLE}
               description={strings.BD_SETTINGS_DESCRIPTIONf}
               icon={() => <Icons.Bd className='unbound-category-icon' />}
               opened={isBdOpen}
               onChange={() => this.setState({ isBdOpen: !isBdOpen })}
            >
               {Object.entries(BDSettings.defaultSettings).map(([category, { settings }]) => {
                  return <Category
                     title={category}
                     className='unbound-settings-sub-category'
                     opened={this.state[category] ?? false}
                     onChange={() => this.setState({
                        [category]: !(this.state[category] ?? false)
                     })}
                  >
                     {settings.map(s => this.handleBDSetting(category, s))}
                  </Category>;
               })}
            </Category>}
         </ErrorBoundary>
      );
   }

   parsePosition(position) {
      if (position.includes('-')) {
         return position.split('-').map((item, idx) => idx === 0 ? item : `${item[0].toUpperCase()}${item.slice(1)}`).join('');
      } else {
         return position.split(/(top|bottom)/).filter(Boolean).join('-').toLowerCase();
      }
   }

   handleBDSetting(category, setting) {
      const BDSettings = window.BDInternal?.SettingsManager;

      switch (setting.type) {
         case 'switch':
            return this.renderSwitch({
               onChange: (v) => BDSettings.setSetting(setting.id, v),
               value: BDSettings.isEnabled(setting.id) ?? setting.value,
               name: setting.name,
               id: setting.id
            });
         case 'category':
            return <Category
               title={setting.name}
               endDivider={true}
               opened={this.state[`${category}-${setting.name}`] ?? false}
               onChange={() => this.setState({
                  [`${category}-${setting.name}`]: !(this.state[`${category}-${setting.name}`] ?? false)
               })}
            >
               {setting.items.map(setting => this.handleBDSetting(category, setting))}
            </Category>;
      }
   }
};

module.exports = Settings.connectComponent(GeneralSettings, 'unbound');