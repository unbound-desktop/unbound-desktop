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
   type: string;
   openSettings: Fn;
   client: string;
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
      const { entity } = this.props;

      const name = (
         entity.instance?._config?.info?.name ??
         entity.manifest?.name ??
         entity.displayName ??
         entity.data?.name ??
         entity.name ??
         Locale.Messages.UNBOUND_ADDON_MISSING_NAME
      );

      const description = (
         entity.instance?._config?.info?.description ??
         entity.manifest?.description ??
         entity.data?.description ??
         entity.description ??
         Locale.Messages.UNBOUND_ADDON_MISSING_DESCRIPTION
      );

      const author = (
         entity.instance?._config?.info?.authors ??
         entity.manifest?.author ??
         entity.data?.authors ??
         entity.getAuthor?.() ??
         entity.author ??
         Locale.Messages.UNBOUND_ADDON_MISSING_AUTHOR
      );

      const color = this.props.client === 'bd' ? '#3E82E5' : (
         entity?.color ??
         entity?.data?.color ??
         entity?.instance?.color ??
         Colors.BRAND
      );

      const version = (
         entity.instance?._config?.info?.version ??
         entity.manifest?.version ??
         entity.getVersion?.() ??
         entity.data?.version ??
         entity.version ??
         Locale.Messages.UNBOUND_ADDON_MISSING_VERSION
      );

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

      switch (client.toLowerCase()) {
         case 'bd':
            return <Bd {...props} />;
         case 'powercord':
            return <Plug {...props} />;
         default:
            return null;
      }
   }

   get isEnabled() {
      const name = this.getName();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);
      return manager?.isEnabled?.(name);
   }

   delete() {
      const name = this.getName();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);
      return manager?.delete?.(name);
   }

   toggle() {
      const name = this.getName();
      const global = this.getGlobal();
      const type = this.getType();

      const manager = (window[global]?.[type] ?? window[global]?.managers?.[type]);

      return manager?.toggle?.(name);
   }

   reload() {
      const name = this.getName();
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

      switch (client.toLowerCase()) {
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

      switch (client.toLowerCase()) {
         case 'powercord':
            return 'powercord';
         case 'bd':
            return 'BdApi';
         case 'unbound':
            return 'unbound';
      }
   }

   hasSettings() {
      const id = this.getId();
      const name = this.getName();

      return this.isEnabled && (
         this.props.entity.instance?.getSettingsPanel ??
         this.props.entity.getSettingsPanel ??
         [...window?.powercord?.api?.settings?.settings?.keys() ?? []].includes(id) ??
         [...window?.powercord?.api?.settings?.settings?.values() ?? []].find?.(e => {
            const searchable = [e.label, e.category];
            if (searchable.includes(id) || searchable.includes(name)) {
               return true;
            }
         })
      );
   }

   getName() {
      return (
         this.props.entity.entityID ??
         this.props.entity.id ??
         this.props.entity.manifest?.name ??
         this.props.entity.name
      );
   }

   getId() {
      return (
         this.props.entity.id ??
         this.props.entity.entityID ??
         this.props.entity.name
      );
   }
};