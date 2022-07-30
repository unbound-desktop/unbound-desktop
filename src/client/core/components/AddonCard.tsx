import { Text, Switch, Anchor, FormText, Markdown, RelativeTooltip, Menu, Tooltip } from '@components/discord';
import { ContextMenu, Layers, Locale } from '@webpack/common';
import { Author } from '@client/managers/base';
import { bind, classnames } from '@utilities';
import { Colors } from '@constants';
import { Icon } from '@components';
import { DMs } from '@webpack/api';
import React from 'react';

import { Plug, Bd } from './Icons';

import Styles from '@styles/panels/addoncard.css';
Styles.append();

interface AddonCardProps {
   openSettings: Fn;
   client: string;
   type: string;
   resolve: Fn;
   entity: any;
}

export default class AddonCard extends React.Component<AddonCardProps> {
   componentWillMount() {
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      manager?.on?.('toggle', this.onToggle);
   }

   componentWillUnmount() {
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);
      manager?.off?.('toggle', this.onToggle);
   }

   render() {
      const { entity, client, resolve } = this.props;

      const author = resolve(entity, client, 'author', { raw: true });
      const description = resolve(entity, client, 'description');
      const version = resolve(entity, client, 'version');
      const color = resolve(entity, client, 'color');
      const name = resolve(entity, client, 'name');

      return (
         <Tooltip
            position='left'
            text={entity.failed ? Locale.Messages[`UNBOUND_ADDON_FAILED_${this.props.type.toUpperCase()}`] : null}
            hideOnClick={false}
         >
            <div
               className={classnames('unbound-addon-card', entity.failed && 'disabled')}
               style={{ '--entity-color': color }}
               onContextMenu={(e) => ContextMenu.openContextMenu(e, () =>
                  <Menu.default onClose={ContextMenu.closeContextMenu}>
                     <Menu.MenuItem
                        id='delete'
                        color='colorDanger'
                        label={Locale.Messages.UNBOUND_DELETE}
                        action={() => this.delete()}
                     />
                     <Menu.MenuItem
                        id='reload'
                        label={Locale.Messages.UNBOUND_RELOAD}
                        action={() => this.reload()}
                     />
                  </Menu.default>
               )}
            >
               <div className='unbound-addon-header'>
                  <Text className='unbound-addon-name' size={Text.Sizes.SIZE_16}>
                     {name}
                  </Text>
                  <Text
                     className='unbound-addon-version'
                     size={Text.Sizes.SIZE_16}
                     color={Text.Colors.INTERACTIVE_NORMAL}
                  >
                     {version}
                  </Text>
                  <Text
                     className='unbound-addon-authors'
                     size={Text.Sizes.SIZE_16}
                     color={Text.Colors.INTERACTIVE_NORMAL}
                  >
                     by {this.renderAuthors(author)}
                  </Text>
                  <div className='unbound-addon-controls'>
                     {this.props.client !== 'unbound' && <RelativeTooltip
                        text={Locale.Messages[`UNBOUND_ADDON_MANAGER_${this.props.client.toUpperCase()}_TOOLTIP`]?.format({ type: 'Plugin' })}
                        hideOnClick={false}
                     >
                        {p => this.renderType({ ...p })}
                     </RelativeTooltip>}
                     {this.hasSettings() && (
                        <RelativeTooltip text={Locale.Messages.UNBOUND_SETTINGS} hideOnClick={false}>
                           {p => <Icon
                              {...p}
                              onClick={() => this.props.openSettings()}
                              data-is-disabled={!this.isEnabled}
                              name='Gear'
                              width={28}
                              height={28}
                              className='unbound-addon-control-button'
                           />}
                        </RelativeTooltip>
                     )}
                     <Switch
                        checked={this.isEnabled}
                        onChange={() => this.toggle()}
                        className='unbound-addon-switch'
                     />
                  </div>
               </div>
               <div className='unbound-addon-footer'>
                  <FormText className='unbound-addon-description'>
                     <Markdown>
                        {description}
                     </Markdown>
                  </FormText>
               </div>
            </div>
         </Tooltip>);
   }

   renderAuthors(authors: Author) {
      const res = [];

      const handleAuthor = (author) => {
         if (typeof author === 'string') {
            res.push(author);
         } else if (typeof author === 'object' && author.name) {
            const id = typeof author.id || typeof author.discord_id;
            const hasId = id && (['number', 'string'].includes(typeof id));

            res.push(hasId ?
               <Anchor
                  className='unbound-addon-author'
                  onClick={() => {
                     Layers?.popLayer?.();
                     DMs?.openPrivateChannel?.([author.id ?? author.discord_id]);
                  }}
               >
                  {author.name}
               </Anchor> :
               author.name
            );
         }
      };

      if (Array.isArray(authors)) {
         authors.map(handleAuthor);
      } else if (typeof authors === 'object' && authors.name) {
         handleAuthor(authors);
      } else if (typeof authors === 'string') {
         res.push(authors);
      }

      return res.map((author, index) => {
         const isLast = index + 1 === res.length;

         if (typeof author === 'string') {
            return isLast ? author : `${author}, `;
         } else {
            return [author, isLast ? '' : ', '];
         }
      });
   }

   renderType(props) {
      const { client } = this.props;

      props.className ??= 'unbound-addon-type-icon';
      props.width ??= 16;
      props.height ??= 16;

      switch (client) {
         case 'bd':
            return <Bd {...props} />;
         case 'powercord':
            return <Plug {...props} />;
         default:
            return null;
      }
   }

   get isEnabled() {
      const name = this.getId();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);
      return manager?.isEnabled?.(name);
   }

   delete() {
      const name = this.getId();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);
      return manager?.delete?.(name);
   }

   toggle() {
      const name = this.getId();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      return manager?.toggle?.(name);
   }

   reload() {
      const name = this.getId();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      if (manager?.reload) {
         return manager.reload(name);
      } else if (manager?.remount) {
         return manager.remount(name);
      }
   }

   @bind
   onToggle(name) {
      const { entity } = this.props;

      if (![entity.id, entity.entityID, entity.name].includes(name)) {
         return;
      }

      this.forceUpdate();
   }

   getType() {
      const { type, client } = this.props;

      switch (client) {
         case 'powercord':
            return type === 'plugins' ? 'pluginManager' : 'styleManager';
         case 'bd':
            return type === 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return type === 'plugins' ? 'plugins' : 'themes';
      }
   }

   getGlobal() {
      const { client } = this.props;

      switch (client) {
         case 'powercord':
            return 'powercord';
         case 'bd':
            return 'BdApi';
         case 'unbound':
            return 'unbound';
      }
   }

   hasSettings() {
      const { client, entity } = this.props;
      const id = this.getId();

      switch (client) {
         case 'powercord':
            const settings = powercord.api.settings.settings;

            if (settings.has(id)) {
               return true;
            }

            const values = [...settings.values()];
            return values.find(e => {
               const searchable = [e.label, e.category];

               if (searchable.includes(id)) {
                  return true;
               }
            });
         case 'unbound':
         case 'bd':
            return entity.instance?.getSettingsPanel;
      }
   }

   getId() {
      const { client, entity } = this.props;

      switch (client) {
         case 'powercord':
            return entity.entityID;
         case 'bd':
            return entity.name;
         case 'unbound':
            return entity.id;
      }
   }
};