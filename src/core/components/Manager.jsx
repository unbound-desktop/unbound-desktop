const { React, Locale: { Messages } } = require('@webpack/common');
const { capitalize } = require('@utilities');
const { getByProps } = require('@webpack');


// merry christmas (christmas tree imports)
const {
   Text,
   Icon,
   Popout,
   SearchBar,
   ErrorBoundary,
   RelativeTooltip,
   Menu: {
      Menu,
      MenuSeparator,
      MenuControlItem,
      MenuCheckboxItem,
   }
} = require('@components');

const AddonCard = require('./AddonCard');

const classes = getByProps('emptyStateImage', 'emptyStateSubtext');

class Manager extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         query: ''
      };
   }

   render() {
      const entities = {
         unbound: [],
         BetterDiscord: [],
         powercord: []
      };

      const best = [...unbound.managers[this.props.type]?.entities?.values()] ?? [];
      if (best.length) entities.unbound.push(...best);

      if (this.props.type == 'plugins' && window.BdApi?.Plugins) {
         const bd = [...BdApi.Plugins.getAll()] ?? [];
         if (bd.length) entities.BetterDiscord.push(...bd);
      } else if (this.props.type == 'themes' && window.BdApi?.Themes) {
         const bd = [...BdApi.Themes.getAll()] ?? [];
         if (bd.length) entities.BetterDiscord.push(...bd);
      }

      if (this.props.type == 'plugins' && window.powercord?.pluginManager) {
         const pc = [...powercord.pluginManager.addons] ?? [];
         if (pc.length) entities.powercord.push(...pc);
      } else if (this.props.type == 'themes' && window.powercord?.styleManager) {
         const pc = [...powercord.styleManager.addons] ?? [];
         if (pc.length) entities.powercord.push(...pc);
      }

      return (
         <ErrorBoundary>
            <div className='unbound-manager-page-header'>
               {this.renderHeader()}
            </div>
            {this.renderEntities(entities)}
         </ErrorBoundary>
      );
   }

   componentWillMount() {
      window.powercord && powercord[this.getType('powercord')].on('updated', this.forceUpdate.bind(this));
      window.BdApi && BdApi[this.getType('betterdiscord')].on('updated', this.forceUpdate.bind(this));
      unbound.managers[this.props.type].on('updated', this.forceUpdate.bind(this));
   }

   componentWillUnmount() {
      window.powercord && powercord[this.getType('powercord')].off('updated', this.forceUpdate.bind(this));
      window.BdApi && BdApi[this.getType('betterdiscord')].off('updated', this.forceUpdate.bind(this));
      unbound.managers[this.props.type].off('updated', this.forceUpdate.bind(this));
   }

   getType(client) {
      const { type } = this.props;
      switch (client) {
         case 'powercord':
            return type == 'plugins' ? 'pluginManager' : 'styleManager';
         case 'betterdiscord':
            return type == 'plugins' ? 'Plugins' : 'Themes';
         case 'unbound':
            return type == 'plugins' ? 'plugins' : 'themes';
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

   renderOverflowMenu() {
      const { get, set } = this.props;

      const filters = get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      return (
         <Menu>
            <MenuControlItem
               id='filters'
               control={() => (
                  <h5 className='unbound-manager-overflow-title'>
                     Search Options
                  </h5>
               )}
            />
            <MenuSeparator key='separator' />
            {Object.keys(filters).map(f =>
               <MenuCheckboxItem
                  key={`filter-${f}`}
                  id={`filter-${f}`}
                  label={capitalize(f)}
                  checked={filters[f]}
                  action={() => {
                     filters[f] = !filters[f];
                     set('filters', filters);
                  }}
               />
            )}
         </Menu>
      );
   }

   renderEntities(entities) {
      const { get } = this.props;
      const filterable = get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      const res = Object.entries(entities).flatMap(([key, value]) => {
         const entities = value.sort((a, b) => {
            const first = this.resolve(a, 'name').toUpperCase();
            const second = this.resolve(b, 'name').toUpperCase();

            return (first < second) ? -1 : (first > second) ? 1 : 0;
         });

         const res = [];

         for (const entity of entities) {
            if (this.state.query !== void 0) {
               const matches = [];

               for (const filter in filterable) {
                  if (!filterable[filter]) continue;

                  const value = this.resolve(entity, filter)?.toLowerCase?.();
                  const query = this.state.query.toLowerCase();

                  if (value?.includes(query)) {
                     matches.push(filter);
                  };
               }

               if (matches.length === 0) {
                  continue;
               }
            }

            res.push(
               <AddonCard
                  manager={this.props.type}
                  type={key}
                  entity={entity}
                  key={this.resolve(entity, 'name')}
               />
            );
         }

         return res;
      });

      return res.length ? res : (
         <div className='unbound-manager-not-found'>
            <div className={classes.emptyStateImage} />
            <Text color={Text.Colors.MUTED}>{Messages.GIFT_CONFIRMATION_HEADER_FAIL}</Text>
            <Text color={Text.Colors.MUTED}>{Messages.SEARCH_NO_RESULTS}</Text>
         </div>
      );
   }

   renderHeader() {
      return (<>
         <SearchBar
            onQueryChange={(value) => this.setState({ query: value })}
            onClear={() => this.setState({ query: '' })}
            placeholder={`Search ${this.props.type}...`}
            size={SearchBar.Sizes.MEDIUM}
            query={this.state.query}
            className='unbound-manager-search-bar'
         />
         <RelativeTooltip text='Store' hideOnClick={false}>
            {props => (
               <Icon
                  {...props}
                  onClick={() => this.forceUpdate()}
                  name='StoreTag'
                  className='unbound-manager-button'
                  width={32}
                  height={32}
               />
            )}
         </RelativeTooltip>
         <RelativeTooltip text='Reload' hideOnClick={false}>
            {props => (
               <Icon
                  {...props}
                  onClick={() => this.forceUpdate()}
                  name='Replay'
                  className='unbound-manager-button'
                  width={32}
                  height={32}
               />
            )}
         </RelativeTooltip>
         <RelativeTooltip text='Options' hideOnClick={false}>
            {props => (
               <Popout
                  position={Popout.Positions.TOP}
                  animation={Popout.Animation.SCALE}
                  align={Popout.Align.RIGHT}
                  spacing={12}
                  renderPopout={this.renderOverflowMenu.bind(this)}
               >
                  {popoutProps => (
                     <Icon
                        {...props}
                        {...popoutProps}
                        name='OverflowMenu'
                        className='unbound-manager-button'
                        width={32}
                        height={32}
                     />
                  )}
               </Popout>
            )}
         </RelativeTooltip>
      </>);
   }

   resolve(entity, filter) {
      switch (filter) {
         case 'name':
            return (
               entity.instance?._config?.info?.name ??
               entity.manifest?.name ??
               entity.displayName ??
               entity.data?.name ??
               entity.name ??
               'No name provided.'
            );
         case 'description':
            return (
               entity.instance?._config?.info?.description ??
               entity.manifest?.description ??
               entity.data?.description ??
               entity.description ??
               'No description provided.'
            );
         case 'author':
            if (Array.isArray(entity.instance?._config?.info?.authors)) {
               const authors = entity.instance._config.info.authors;
               return authors.map(a => a?.name?.toLowerCase?.()).filter(Boolean).join(', ');
            } else if (Array.isArray(entity.data?.author)) {
               const authors = entity.data.author;
               return authors.map(a => (a?.name ?? a)?.toLowerCase?.()).filter(Boolean).join(', ');
            }

            return (
               entity.manifest?.author ??
               entity.getAuthor?.() ??
               entity.data?.author ??
               entity.author ??
               'No author provided.'
            );
         case 'version':
            return (
               entity.instance?._config?.info?.version ??
               entity.getVersion?.() ??
               entity.data?.version ??
               entity.version ??
               'No version provided.'
            );
         default:
            return 'Not found.';
      }
   }
};

module.exports = unbound.apis.settings.connectStores('manager-tab-settings')(Manager);