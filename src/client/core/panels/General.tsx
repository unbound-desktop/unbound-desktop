import type Toast from '@api/toasts/components/Toast';

import { ColorPicker, SettingsItem, SliderInput, Switch } from '@components/settings';
import { ErrorBoundary, Category, AsyncComponent, Divider, Icon } from '@components';
import { FormTitle, Tooltip } from '@components/discord';
import { connectComponent } from '@api/settings';
import { Locale, Colors } from '@webpack/common';
import { memoize, parseColor } from '@utilities';
import { filters, findLazy } from '@webpack';
import * as Toasts from '@api/toasts';
import React from 'react';


import Styles from '@styles/panels/general.css';
import { Bd } from '@core/components/Icons';
Styles.append();

const NotificationSettings = memoize(() => findLazy(filters.byDisplayName('NotificationSettings')));
const BoundSelector = AsyncComponent.from(NotificationSettings);

interface GeneralPanelProps {
   settings: SettingsStore;
}

interface GeneralPanelState {
   toasts: boolean;
   developer: boolean;
   bd: boolean;
   [key: string]: any;
}

class General extends React.Component<GeneralPanelProps, GeneralPanelState> {
   public toasts: Toast[];

   constructor(props) {
      super(props);

      this.state = {
         toasts: false,
         developer: false,
         splash: false,
         bd: false,
         splashAdd: ''
      };
   }

   render() {
      return <ErrorBoundary>
         <FormTitle tag='h1' className='unbound-settings-title'>
            {Locale.Messages.UNBOUND_GENERAL}
         </FormTitle>
         {this.renderToasts()}
         {this.renderSplash()}
         {this.renderDeveloper()}
         {this.renderBDSettings()}
      </ErrorBoundary>;
   }

   renderToasts() {
      const { settings } = this.props;

      const defaultBg = parseColor('--background-tertiary');

      return <Category
         title={Locale.Messages.UNBOUND_TOAST_SETTINGS_TITLE}
         description={Locale.Messages.UNBOUND_TOAST_SETTINGS_DESCRIPTION}
         icon='ChatBubble'
         className='unbound-settings-toast-category'
         opened={this.state.toasts}
         onChange={() => this.setState(s => ({ ...s, toasts: !s.toasts }))}
      >
         <BoundSelector
            className='unbound-settings-toast-position'
            position={this.parsePosition(settings.get('toasts.position', 'bottom-right'))}
            onChange={(_, v) => {
               const position = this.parsePosition(v);
               settings.set('toasts.position', position);
               this.onToastsChange();

               if (position === 'disabled') {
                  Toasts.clear();
               }
            }}
         />
         <Divider style={{ marginTop: 10 }} />
         <Switch
            title={Locale.Messages.UNBOUND_TOAST_SETTINGS_RESET_TIMEOUT_TITLE}
            description={Locale.Messages.UNBOUND_TOAST_SETTINGS_RESET_TIMEOUT_DESCRIPTION}
            checked={settings.get('toasts.resetTimeoutOnHover', false)}
            onChange={() => settings.toggle('toasts.resetTimeoutOnHover', false)}
         />
         <Switch
            title={Locale.Messages.UNBOUND_TOAST_SETTINGS_CUSTOM_TITLE}
            description={Locale.Messages.UNBOUND_TOAST_SETTINGS_CUSTOM_DESCRIPTION}
            checked={settings.get('toasts.useCustomColours', false)}
            endDivider={settings.get('toasts.useCustomColours', false)}
            onChange={() => settings.toggle('toasts.useCustomColours', false)}
            bottomMargin={settings.get('toasts.useCustomColours', false) ? 15 : 7.5}
         />
         {settings.get('toasts.useCustomColours', false) && <>
            <ColorPicker
               value={settings.get('toasts.bgColor')}
               className='unbound-settings-toast-color'
               onChange={v => settings.set('toasts.bgColor', v)}
               default={Colors.rgb2int(`rgb(${defaultBg[0]}, ${defaultBg[1]}, ${defaultBg[2]})`)}
            />
            <SliderInput
               title={Locale.Messages.UNBOUND_TOAST_SETTINGS_OPACITY_TITLE}
               minValue={1}
               maxValue={10}
               markers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
               defaultValue={10}
               initialValue={(settings.get('toasts.bgOpacity', 0.5) * 10)}
               onValueChange={v => settings.set('toasts.bgOpacity', v / 10)}
               onMarkerRender={v => `${v / 10}`}
               onValueRender={v => (v / 10).toFixed(2)}
            />
            <SliderInput
               title={Locale.Messages.UNBOUND_TOAST_SETTINGS_BLUR_TITLE}
               minValue={0}
               maxValue={15}
               markers={[0, 2.5, 5, 7.5, 10, 12.5, 15]}
               defaultValue={7.5}
               initialValue={settings.get('toasts.blurAmount', 7.5)}
               onValueChange={v => settings.set('toasts.blurAmount', v)}
               endDivider={false}
               bottomMargin={7.5}
               onValueRender={v => v.toFixed(1)}
            />
         </>}
      </Category>;
   }

   renderDeveloper() {
      const { settings } = this.props;

      return <Category
         title={Locale.Messages.UNBOUND_DEV_SETTINGS_TITLE}
         description={Locale.Messages.UNBOUND_DEV_SETTINGS_DESCRIPTION}
         icon='InlineCode'
         className='unbound-settings-developer-category'
         opened={this.state.developer}
         onChange={() => this.setState(s => ({ ...s, developer: !s.developer }))}
      >
         <Switch
            title={Locale.Messages.UNBOUND_DEV_SETTINGS_WARNING_TITLE}
            description={Locale.Messages.UNBOUND_DEV_SETTINGS_WARNING_DESCRIPTION}
            checked={settings.get('dev.devtoolsWarning', false)}
            onChange={() => settings.toggle('dev.devtoolsWarning', false)}
         />
         <Switch
            title={Locale.Messages.UNBOUND_DEV_SETTINGS_EXPERIMENTS_TITLE}
            description={Locale.Messages.UNBOUND_DEV_SETTINGS_EXPERIMENTS_DESCRIPTION}
            checked={settings.get('dev.experiments', false)}
            onChange={() => settings.toggle('dev.experiments', false)}
            bottomMargin={7.5}
            endDivider={false}
         />
         <div style={{ marginBottom: 2.5 }} />
      </Category>;
   }

   renderSplash() {
      const { settings } = this.props;

      const quotes = settings.get('splashQuotes', ['Unleash the chains']);

      return <Category
         title={Locale.Messages.UNBOUND_SPLASH_SETTINGS_TITLE}
         description={Locale.Messages.UNBOUND_SPLASH_SETTINGS_DESCRIPTION}
         icon='Fullscreen'
         className='unbound-settings-splash-category'
         opened={this.state.splash}
         onChange={() => this.setState(s => ({ ...s, splash: !s.splash }))}
      >
         <SettingsItem
            title={Locale.Messages.UNBOUND_SPLASH_SETTINGS_QUOTES_TITLE}
            endDivider={false}
         >
            <div className='unbound-settings-splash-quotes' data-count={quotes.length ?? 0}>
               {Array.isArray(quotes) && quotes.map(quote =>
                  <div
                     onMouseEnter={e => (e.target as any).classList.add('is-hovered')}
                     onMouseLeave={e => (e.target as any).classList.remove('is-hovered')}
                     className='unbound-settings-splash-quote'
                     onClick={() => {
                        const idx = quotes.indexOf(quote);
                        if (idx > -1) {
                           quotes.splice(idx, 1);
                           settings.set('splashQuotes', quotes);
                        }
                     }}
                  >
                     <span>{quote}</span>
                     <span className='unbound-settings-splash-quote-remove'>
                        {Locale.Messages.UNBOUND_SPLASH_SETTINGS_QUOTES_REMOVE}
                     </span>
                  </div>
               )}
               <div className='unbound-settings-splash-quote-wrapper'>
                  <input
                     placeholder={Locale.Messages.UNBOUND_SPLASH_SETTINGS_QUOTES_ADD}
                     className='unbound-settings-splash-quote-add'
                     onChange={e => this.setState({ splashAdd: e.target.value })}
                     value={this.state.splashAdd}
                  />
                  <Tooltip
                     className='unbound-settings-splash-quote-tooltip'
                     text={Locale.Messages.UNBOUND_SPLASH_SETTINGS_QUOTES_TOOLTIP}
                  >
                     <div
                        onClick={() => {
                           if ([...this.state.splashAdd].filter(Boolean).length === 0) {
                              return;
                           }

                           quotes.push(this.state.splashAdd);
                           settings.set('splashQuotes', quotes);
                           this.setState({ splashAdd: '' });
                        }}
                     >
                        <Icon
                           className='unbound-settings-splash-quote-add-icon'
                           width={24}
                           height={18}
                           name='PlusCircle'
                        />
                     </div>
                  </Tooltip>
               </div>
            </div>
         </SettingsItem>
         <div style={{ marginBottom: 2.5 }} />
      </Category>;
   }

   renderBDSettings() {
      if (!window.BdApi) return null;

      const settings = window.BDInternal?.SettingsManager;

      return <Category
         title={Locale.Messages.UNBOUND_BD_SETTINGS_TITLE}
         description={Locale.Messages.UNBOUND_BD_SETTINGS_DESCRIPTION}
         icon={() => <Bd className='unbound-category-icon' />}
         opened={this.state.bd}
         onChange={() => this.setState({ bd: !this.state.bd })}
      >
         {(Object.entries(settings.defaultSettings) as any).map(([category, { settings }]) => {
            return settings.map(s => this.renderBDSetting(category, s));
         })}
      </Category>;
   }

   renderBDSetting(category, setting) {
      const settings = window.BDInternal?.SettingsManager;

      switch (setting.type) {
         case 'switch':
            return setting.requires && setting.requires.some(s => !settings.isEnabled(s)) ? null : <Switch
               endDivider={false}
               className='unbound-bd-switch'
               title={setting.name}
               checked={settings.isEnabled(setting.id) ?? setting.value}
               onChange={v => {
                  settings.setSetting(setting.id, v);
                  this.forceUpdate();
               }}
            />;
         case 'category':
            return setting.requires && setting.requires.some(s => !settings.isEnabled(s)) ? null : <Category
               className='unbound-bd-category'
               title={setting.name}
               endDivider={true}
               opened={this.state[`${category}-${setting.name}`] ?? false}
               onChange={() => this.setState({
                  [`${category}-${setting.name}`]: !(this.state[`${category}-${setting.name}`] ?? false)
               })}
            >
               {setting.items.map(setting => this.renderBDSetting(category, setting))}
            </Category>;
      }
   }

   componentWillUnmount() {
      if (!this.toasts) return;

      for (const toast of this.toasts) {
         Toasts.close(toast);
      }
   }

   onToastsChange() {
      this.toasts ??= [];

      for (const toast of this.toasts) {
         Toasts.close(toast, true);
      }

      this.toasts.push(Toasts.open({
         title: Locale.Messages.UNBOUND_TOAST_EXAMPLE_TITLE,
         color: 'var(--info-positive-foreground)',
         icon: 'CheckmarkCircle',
         content: Locale.Messages.UNBOUND_TOAST_EXAMPLE_CONTENT
      }));
   }

   parsePosition(position): 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'disabled' {
      if (position.includes('-')) {
         return position.split('-').map((item, idx) => idx === 0 ? item : `${item[0].toUpperCase()}${item.slice(1)}`).join('');
      } else {
         return position.split(/(top|bottom)/).filter(Boolean).join('-').toLowerCase();
      }
   }
}

export default connectComponent(General, 'unbound');