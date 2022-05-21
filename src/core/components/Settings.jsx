const { getLazy, filters } = require('@webpack');
const { React } = require('@webpack/common');
const { memoize } = require('@utilities');
const { strings } = require('@api/i18n');

const { Divider, Text, ErrorBoundary, Category, FormTitle, Icon, Switch: DSwitch, AsyncComponent } = require('@components');
const { Switch, SliderInput, ColorPicker } = require('@components/settings');
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
         <DSwitch
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
         isToastsOpen = false,
         isDeveloperOpen = false,
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
               className='unbound-settings-toast-category'
               opened={isToastsOpen}
               onChange={() => {
                  this.setState({ isToastsOpen: !isToastsOpen });
                  if (!isToastsOpen) this.onToastsChange();
               }}
            >
               <BoundSelector
                  className='unbound-settings-toast-position'
                  position={this.parsePosition(this.settings.get('toastPosition', 'bottom-right'))}
                  onChange={(_, v) => {
                     const position = this.parsePosition(v);
                     this.settings.set('toastPosition', position);
                     this.onToastsChange();

                     if (position === 'disabled') {
                        Toasts.clear();
                     }
                  }}
               />
               <Divider style={{ marginTop: 10 }} />
               <Switch
                  title='Custom Styling'
                  description='Allows you to change background color, opacity and blur.'
                  checked={this.settings.get('useCustomColours', false)}
                  onChange={() => this.settings.toggle('useCustomColours', false)}
               />
               {this.settings.get('useCustomColours', false) && <>
                  <ColorPicker
                     className='unbound-settings-toast-color'
                     value={this.settings.get('bgColor')}
                     onChange={v => this.settings.set('bgColor', v)}
                  />
                  <SliderInput
                     title='Opacity'
                     minValue={1}
                     maxValue={10}
                     stickToMarkers
                     markers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                     defaultValue={5}
                     initialValue={(this.settings.get('bgOpacity', 0.5) * 10)}
                     onValueChange={(val) => this.settings.set('bgOpacity', val / 10)}
                     onMarkerRender={(v) => `${v / 10}`}
                  />
                  <SliderInput
                     title='Blur'
                     minValue={2.5}
                     maxValue={15}
                     stickToMarkers
                     markers={[2.5, 5, 7.5, 10, 12.5, 15]}
                     defaultValue={7.5}
                     initialValue={this.settings.get('blurAmount', 7.5)}
                     onValueChange={(val) => this.settings.set('blurAmount', val)}
                     onMarkerRender={(v) => `${v}px`}
                  />
               </>}
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

   componentWillUnmount() {
      for (const toast of this.toasts) {
         Toasts.close(toast);
      }
   }

   onToastsChange() {
      this.toasts ??= [];

      for (const toast of this.toasts) {
         Toasts.close(toast);
      }

      this.toasts.push(Toasts.open({
         title: strings.TOAST_EXAMPLE_TITLE,
         color: 'var(--info-positive-foreground)',
         icon: 'CheckmarkCircle',
         content: strings.TOAST_EXAMPLE_CONTENT
      }));
   }
};

module.exports = Settings.connectComponent(GeneralSettings, 'unbound');