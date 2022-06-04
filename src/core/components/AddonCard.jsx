const { Text, Icon, Switch, Anchor, FormText, Markdown, RelativeTooltip, Menu: { Menu, MenuItem } } = require('@components');
const { React, ContextMenu, Layers } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { strings } = require('@api/i18n');
const { DMs } = require('@webpack/api');
const { Plug, Bd } = require('./Icons');

module.exports = class AddonCard extends React.Component {
   onToggle = this.onToggle.bind(this);

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
         strings.MISSING_NAME
      );

      const description = (
         entity.instance?._config?.info?.description ??
         entity.manifest?.description ??
         entity.data?.description ??
         entity.description ??
         strings.MISSING_DESCRIPTION
      );

      const author = (
         entity.instance?._config?.info?.authors ??
         entity.manifest?.author ??
         entity.data?.authors ??
         entity.getAuthor?.() ??
         entity.data?.author ??
         entity.author ??
         strings.MISSING_AUTHOR
      );

      const color = (
         entity?.color ??
         entity?.data?.color ??
         entity?.instance?.color ??
         '#c74050'
      );

      const version = (
         entity.instance?._config?.info?.version ??
         entity.manifest?.version ??
         entity.getVersion?.() ??
         entity.data?.version ??
         entity.version ??
         strings.MISSING_VERSION
      );

      return (
         <div
            className='unbound-addon-card'
            style={{ '--entity-color': color }}
            onContextMenu={(e) => ContextMenu.openContextMenu(e, () =>
               <Menu onClose={ContextMenu.closeContextMenu}>
                  <MenuItem
                     id='delete'
                     color='colorDanger'
                     label={strings.DELETE}
                     action={() => this.delete()}
                  />
                  <MenuItem
                     id='reload'
                     label={strings.RELOAD}
                     action={() => this.reload()}
                  />
               </Menu>
            )}
         >
            <div className='unbound-addon-header'>
               <Text
                  className='unbound-addon-name'
                  size={Text.Sizes.SIZE_16}
               >
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
                  <RelativeTooltip
                     text={`${capitalize(this.props.type)} Addon`}
                     hideOnClick={false}
                  >
                     {p => this.renderType({ ...p })}
                  </RelativeTooltip>
                  {this.hasSettings() && (
                     <RelativeTooltip text={strings.SETTINGS} hideOnClick={false}>
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
                     onChange={(v) => this.toggle(v)}
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
      );
   }

   renderAuthors(authors) {
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
      props.className ??= 'unbound-addon-type-icon';
      props.width ??= 16;
      props.height ??= 16;

      switch (this.props.type.toLowerCase()) {
         case 'betterdiscord':
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

   onToggle(name) {
      const { entity } = this.props;

      if (![entity.id, entity.entityID, entity.name].includes(name)) {
         return;
      }

      this.forceUpdate();
   }

   getType() {
      const { manager } = this.props;
      switch (this.props.type.toLowerCase()) {
         case 'powercord':
            return manager == 'plugins' ? 'pluginManager' : 'styleManager';
         case 'betterdiscord':
            return manager == 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return manager == 'plugins' ? 'plugins' : 'themes';
      }
   }

   getGlobal() {
      switch (this.props.type.toLowerCase()) {
         case 'powercord':
            return 'powercord';
         case 'betterdiscord':
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