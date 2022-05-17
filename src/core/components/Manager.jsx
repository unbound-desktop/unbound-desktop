const { Text, Icon, Popout, SearchBar, FormTitle, ErrorBoundary, RelativeTooltip, Menu } = require('@components');
const { React, Locale: { Messages }, ContextMenu } = require('@webpack/common');
const { createLogger } = require('@modules/logger');
const { getByDisplayName } = require('@webpack');
const { classnames } = require('@utilities');
const Settings = require('@api/settings');
const { strings } = require('@api/i18n');
const { shell } = require('electron');
const path = require('path');

const Caret = getByDisplayName('Caret');
const AddonCard = require('./AddonCard');
const DOMWrapper = require('./DOMWrapper');

const Logger = createLogger('Manager');

class Manager extends React.PureComponent {
   constructor(props) {
      super(props);

      this.state = {
         query: '',
         settings: null
      };

      this.settings = props.settings;
   }

   render() {
      if (this.state.settings?.entity) {
         const { client, entity } = this.state.settings;
         const settings = this.resolve(entity, 'settings');

         try {
            // If a component instance instance is returned, render it. If not, let them do whatever.
            const API = unbound.apis.settings;
            const id = this.resolve(entity, 'id');

            if (typeof settings === 'function') {
               const res = settings();

               if (res) {
                  const Component = client === 'unbound' ? API.connectStores(id)(res) : res;

                  return <ErrorBoundary>
                     {this.renderTitle(null, entity)}
                     {typeof Component === 'function' ? <Component /> : Component instanceof Element ?
                        <DOMWrapper>{Component}</DOMWrapper> :
                        Component
                     }
                  </ErrorBoundary>;
               }
            } else if (settings?.render) {
               const Component = client === 'unbound' ?
                  API.connectStores(id)(settings.render) :
                  settings.render;

               return <ErrorBoundary>
                  {this.renderTitle(null, entity)}
                  <Component />
               </ErrorBoundary>;
            }
         } catch (e) {
            Logger.error(`Failed to open settings for ${this.resolve(entity, 'name')} (${client} addon)`, e);
         }
      }

      const entities = {
         unbound: [],
         BetterDiscord: [],
         powercord: []
      };

      const unboundEntities = [...unbound.managers[this.props.type]?.entities?.values()] ?? [];
      if (unboundEntities.length) entities.unbound.push(...unboundEntities);

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

      const addons = this.renderEntities(entities);

      return (
         <ErrorBoundary>
            {this.renderTitle(addons.amount)}
            {this.renderHeader()}
            <div className={classnames('unbound-manager-entities', `unbound-manager-${this.props.type}`)}>
               {addons.render}
            </div>
         </ErrorBoundary>
      );
   }

   componentWillMount() {
      const forceUpdate = this.forceUpdate.bind(this, null);

      // Compatibility Layers
      window.powercord && powercord[this.getType('powercord')].on('updated', forceUpdate);
      window.BdApi && BdApi[this.getType('betterdiscord')].on('updated', forceUpdate);
      unbound.managers[this.props.type].on('updated', forceUpdate);
   }

   componentWillUnmount() {
      const forceUpdate = this.forceUpdate.bind(this, null);

      // Compatibility Layers
      window.powercord && powercord[this.getType('powercord')].off('updated', forceUpdate);
      window.BdApi && BdApi[this.getType('betterdiscord')].off('updated', forceUpdate);
      unbound.managers[this.props.type].off('updated', forceUpdate);
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

   renderOverflowMenu() {
      const { get, set } = this.settings;
      const { type } = this.props;

      const filters = get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      return (
         <Menu.Menu onClose={ContextMenu.closeContextMenu}>
            <Menu.MenuControlItem
               id='filters'
               control={() => (
                  <h5 className='unbound-manager-overflow-title'>
                     {strings.SEARCH_OPTIONS}
                  </h5>
               )}
            />
            <Menu.MenuSeparator key='separator' />
            {Object.keys(filters).map(f =>
               <Menu.MenuCheckboxItem
                  key={`filter-${f}`}
                  id={`filter-${f}`}
                  label={strings[f.toUpperCase()]}
                  checked={filters[f]}
                  action={() => {
                     filters[f] = !filters[f];
                     set('filters', filters);
                  }}
               />
            )}
            {/* <Menu.MenuSeparator key='separator' />
            <Menu.MenuItem
               key={`filter-${type}`}
               id={`filter-${type}`}
               label={`Open ${type} folder`}
               action={() => {
                  try {
                     const folder = path.resolve(__dirname, '..', '..', '..', type);
                     shell.openPath(folder);
                  } catch { }
               }}
            /> */}
         </Menu.Menu>
      );
   }

   renderEntities(entities) {
      const { get } = this.settings;
      const filterable = get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      const res = Object.entries(entities).flatMap(([client, value]) => {
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
                  type={client}
                  entity={entity}
                  key={`${this.resolve(entity, 'id')}-${client}`}
                  openSettings={() => this.setState({ settings: { entity, client } })}
               />
            );
         }

         return res;
      });

      return {
         render: res.length ? res : (
            <div className='unbound-manager-not-found'>
               <div className='unbound-manager-empty-state' />
               <Text color={Text.Colors.MUTED}>{Messages.GIFT_CONFIRMATION_HEADER_FAIL}</Text>
               <Text color={Text.Colors.MUTED}>{Messages.SEARCH_NO_RESULTS}</Text>
            </div>
         ),
         amount: res.length
      };
   }

   renderTitle(amount, settings) {
      return (
         <div
            className={classnames('unbound-manager-title', settings && 'unbound-manager-title-has-settings')}
            onClick={() => settings && this.setState({ settings: null })}
         >
            <FormTitle tag='h1' className='unbound-manager-title-main'>
               {strings[this.props.type.toUpperCase()]} {amount && `- ${amount}`} {settings && <Caret
                  direction={Caret.Directions.RIGHT}
                  className='unbound-manager-title-caret'
               />}
            </FormTitle>
            {settings && <FormTitle className='unbound-manager-title-settings' tag='h1'>
               {this.resolve(settings, 'name')}
            </FormTitle>}
         </div>
      );
   }

   renderHeader() {
      return (
         <div className='unbound-manager-page-header'>
            <SearchBar
               onQueryChange={(value) => this.setState({ query: value })}
               onClear={() => this.setState({ query: '' })}
               placeholder={strings[`SEARCH_${this.props.type.toUpperCase()}`]}
               size={SearchBar.Sizes.MEDIUM}
               query={this.state.query}
               className='unbound-manager-search-bar'
            />
            {/* <RelativeTooltip text='Store' hideOnClick={false}>
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
            </RelativeTooltip> */}
            <RelativeTooltip text={strings.OPEN_FOLDER} hideOnClick={false}>
               {props => (
                  <Icon
                     {...props}
                     onClick={() => {
                        try {
                           const folder = path.resolve(__dirname, '..', '..', '..', this.props.type);
                           shell.openPath(folder);
                        } catch { }
                     }}
                     name='Folder'
                     className='unbound-manager-button'
                     width={32}
                     height={32}
                  />
               )}
            </RelativeTooltip>
            <RelativeTooltip text={strings.RELOAD} hideOnClick={false}>
               {props => (
                  <Icon
                     {...props}
                     onClick={() => {
                        const powercord = window?.powercord?.[this.getType('powercord')];
                        if (powercord) {
                           powercord.loadAll(true);
                        }

                        unbound.managers[this.getType('unbound')].loadAll();
                     }}
                     name='Replay'
                     className='unbound-manager-button'
                     width={32}
                     height={32}
                  />
               )}
            </RelativeTooltip>
            <RelativeTooltip text={strings.OPTIONS} hideOnClick={false}>
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
         </div>
      );
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
               strings.MISSING_NAME
            );
         case 'id':
            return (
               entity.id ??
               entity.entityID ??
               entity.name
            );
         case 'description':
            return (
               entity.instance?._config?.info?.description ??
               entity.manifest?.description ??
               entity.data?.description ??
               entity.description ??
               strings.MISSING_DESCRIPTION
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
               strings.MISSING_AUTHOR
            );
         case 'version':
            return (
               entity.instance?._config?.info?.version ??
               entity.getVersion?.() ??
               entity.data?.version ??
               entity.version ??
               strings.MISSING_VERSION
            );
         case 'settings':
            const id = this.resolve(entity, 'id');
            const name = this.resolve(entity, 'name');
            return (
               entity.instance?.getSettingsPanel?.bind?.(entity.instance) ??
               entity.getSettingsPane?.bind?.(entity) ??
               window?.powercord?.api?.settings?.settings?.[id] ??
               [...window?.powercord?.api?.settings?.settings?.values() ?? []].find?.(e => {
                  const searchable = [e.label, e.category];
                  if (searchable.includes(id) || searchable.includes(name)) {
                     return true;
                  }
               })
            );
         default:
            return strings.NOT_FOUND;
      }
   }
};

module.exports = Settings.connectComponent(Manager, 'manager-tab-settings');