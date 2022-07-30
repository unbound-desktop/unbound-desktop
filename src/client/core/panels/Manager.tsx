import { Text, Caret, Menu, FormTitle, RelativeTooltip, SearchBar, Popout } from '@components/discord';
import DOMWrapper from '@core/components/DOMWrapper';
import AddonCard from '@core/components/AddonCard';
import { ErrorBoundary, Icon } from '@components';
import { bind, classnames } from '@utilities';
import { Colors, Paths } from '@constants';
import * as Settings from '@api/settings';
import { Locale } from '@webpack/common';
import * as Toasts from '@api/toasts';
import { shell } from 'electron';
import React from 'react';

import Styles from '@styles/panels/managers.css';
Styles.append();

interface ManagerPanelProps {
   settings: SettingsStore;
   type: string;
}

interface ManagerPanelState {
   search: string;
   breadcrumbs: string[];
   settings: {
      entity?: Record<string, any>;
      client?: string;
   };
}

interface AddonFetchResponse {
   addons: Record<string, any>;
   count: number;
}

class Manager extends React.PureComponent<ManagerPanelProps, ManagerPanelState> {
   public type: string;

   constructor(props, type) {
      super(props);

      this.type = type;
      this.state = {
         search: '',
         breadcrumbs: [],
         settings: {
            entity: null,
            client: null
         }
      };
   }

   render() {
      const addons = this.renderAddons();

      if (this.state.settings?.entity) {
         return this.renderSettings();
      }

      return <ErrorBoundary>
         {this.renderTitle(addons.count)}
         {this.renderHeader()}
         {addons.render}
      </ErrorBoundary>;
   }

   renderHeader() {
      return (
         <div className='unbound-manager-page-header'>
            <SearchBar
               onQueryChange={v => this.setState({ search: v })}
               onClear={() => this.setState({ search: '' })}
               placeholder={Locale.Messages[`UNBOUND_SEARCH_${this.type?.toUpperCase()}`]}
               size={SearchBar.Sizes.MEDIUM}
               query={this.state.search}
               className='unbound-manager-search-bar'
            />
            <RelativeTooltip text={Locale.Messages.UNBOUND_OPEN_FOLDER} hideOnClick={false}>
               {props => (
                  <Icon
                     {...props}
                     onClick={() => {
                        try {
                           shell.openPath(Paths[this.type]);
                        } catch {
                           Toasts.open({
                              title: 'Failed to open folder',
                              icon: 'Close',
                              color: 'var(--info-danger-foreground)',
                              content: `We have encountered an error trying to open the ${this.type} folder for you. Does the ${this.type} folder exist?`
                           });
                        }
                     }}
                     name='Folder'
                     className='unbound-manager-button'
                     width={32}
                     height={32}
                  />
               )}
            </RelativeTooltip>
            <RelativeTooltip text={Locale.Messages.UNBOUND_RELOAD} hideOnClick={false}>
               {props => (
                  <Icon
                     {...props}
                     onClick={this.onReload}
                     name='Replay'
                     className='unbound-manager-button'
                     width={32}
                     height={32}
                  />
               )}
            </RelativeTooltip>
            <RelativeTooltip text={Locale.Messages.UNBOUND_SEARCH_OPTIONS} hideOnClick={false}>
               {props => (
                  <Popout
                     position={Popout.Positions.TOP}
                     animation={Popout.Animation.SCALE}
                     align={Popout.Align.RIGHT}
                     spacing={12}
                     renderPopout={this.renderOverflowMenu}
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

   renderTitle(count?: number) {
      const title = Locale.Messages[`UNBOUND_${this.type.toUpperCase()}`];
      const suffix = !this.state.breadcrumbs.length && count ? ` - ${count}` : '';

      return (
         <div className='unbound-manager-title'>
            <FormTitle
               tag='h1'
               onClick={() => this.setState({ settings: null, breadcrumbs: [] })}
               className={classnames(
                  'unbound-manager-title-main',
                  this.state.breadcrumbs.length && 'unbound-manager-title-unselected'
               )}
            >
               {title}{suffix}
               {!!this.state.breadcrumbs.length && <Caret
                  direction={Caret.Directions.RIGHT}
                  className='unbound-manager-title-caret'
               />}
            </FormTitle>
            {this.renderBreadcrumbs()}
         </div>
      );
   }

   renderBreadcrumbs() {
      return this.state.breadcrumbs.map((breadcrumb, index, breadcrumbs) => {
         const idx = index + 1;
         const isLast = idx >= breadcrumbs.length;

         return <FormTitle
            tag='h1'
            className={!isLast && 'unbound-manager-title-unselected'}
            onClick={() => !isLast && this.setState({ breadcrumbs: breadcrumbs.slice(0, idx) })}
         >
            {breadcrumb}
            {!isLast && <Caret
               direction={Caret.Directions.RIGHT}
               className='unbound-manager-title-caret'
            />}
         </FormTitle>;
      });
   }

   renderAddon(client: string, entity: any) {
      return (
         <AddonCard
            type={this.type}
            resolve={this.resolve}
            client={client}
            entity={entity}
            openSettings={() => this.setState({ settings: { entity, client } })}
         />
      );
   }

   renderAddons(): { render: any[], count: number; } {
      const { addons } = this.getAddons();
      const { settings } = this.props;
      const { search } = this.state;

      const filterable = settings.get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      const res = Object.entries(addons).flatMap(([client, value]: [string, any]) => {
         const entities = value.sort((a, b) => {
            const first = this.resolve(a, client, 'name').toUpperCase();
            const second = this.resolve(b, client, 'name').toUpperCase();

            return (first < second) ? -1 : (first > second) ? 1 : 0;
         });

         const addons = [];

         for (const entity of entities) {
            if (search !== void 0) {
               const matches = [];

               for (const filter in filterable) {
                  if (!filterable[filter]) continue;

                  const value = this.resolve(entity, client, filter)?.toLowerCase?.();
                  const query = search.toLowerCase();

                  if (value?.includes(query)) {
                     matches.push(filter);
                  };
               }

               if (matches.length === 0) {
                  continue;
               }
            }


            addons.push(this.renderAddon(client, entity));
         }

         return addons;
      });

      return {
         count: res.length,
         render: res.length ? res as any : <div className='unbound-manager-not-found'>
            <div data-has-search={Boolean(search.length)} className='unbound-manager-empty-state' />
            {!search.length && <Text color={Text.Colors.MUTED}>
               {Locale.Messages.GIFT_CONFIRMATION_HEADER_FAIL}
            </Text>}
            <Text style={{ textAlign: 'center' }} color={Text.Colors.MUTED}>
               {search.length ?
                  Locale.Messages.SEARCH_NO_RESULTS :
                  Locale.Messages.UNBOUND_NO_ADDONS.format({ type: this.type })
               }
            </Text>
            {!search.length && <Text style={{ textAlign: 'center' }} color={Text.Colors.MUTED}>
               {Locale.Messages.UNBOUND_NO_ADDONS_SUBTEXT}
            </Text>}
         </div>
      };
   }

   @bind
   renderOverflowMenu() {
      const { settings } = this.props;

      const filters = settings.get('filters', {
         name: true,
         description: true,
         author: true,
         version: true
      });

      return <Menu.default>
         <Menu.MenuGroup>
            <Menu.MenuControlItem
               id='filters'
               control={() => (
                  <h5 className='unbound-manager-overflow-title'>
                     {Locale.Messages.UNBOUND_FILTERS}
                  </h5>
               )}
            />
            {Object.keys(filters).sort().map(f =>
               <Menu.MenuCheckboxItem
                  key={`filter-${f}`}
                  id={`filter-${f}`}
                  label={Locale.Messages[`UNBOUND_FILTER_${f.toUpperCase()}`]}
                  checked={filters[f]}
                  action={() => {
                     filters[f] = !filters[f];
                     settings.set('filters', filters);
                  }}
               />
            )}
         </Menu.MenuGroup>
      </Menu.default>;
   }

   renderSettings() {
      const { client, entity } = this.state.settings;
      const settings = this.resolve(entity, client, 'settings');
      if (!this.state.breadcrumbs.length && entity) {
         this.setState({ breadcrumbs: [this.resolve(entity, client, 'name')] });
      }

      const router = {
         breadcrumbs: this.state.breadcrumbs,
         push: (...items) => this.setState({ breadcrumbs: [...this.state.breadcrumbs, ...items] }),
         back: (amount) => {
            if (this.state.breadcrumbs.length - (amount || 1) <= 0)
               this.setState({ settings: null, breadcrumbs: [] });

            this.setState({ breadcrumbs: this.state.breadcrumbs.slice(0, -(amount || 1)) });
         },
      };

      try {
         const id = this.resolve(entity, client, 'id');

         if (typeof settings === 'function') {
            const res = settings();

            if (res) {
               const Component = client === 'unbound' ? Settings.connectComponent(res, id) : res;
               const isFunc = typeof Component === 'function';
               const isNode = Component instanceof Element;

               return <ErrorBoundary>
                  {this.renderTitle()}
                  {isFunc ? <Component router={router} /> : isNode ?
                     <DOMWrapper>
                        {Component}
                     </DOMWrapper> :
                     Component
                  }
               </ErrorBoundary>;
            }
         } else if (settings?.render) {
            const Component = client === 'unbound' ?
               Settings.connectComponent(settings.render, id) :
               settings.render;

            return <ErrorBoundary>
               {this.renderTitle()}
               <Component router={router} />
            </ErrorBoundary>;
         }
      } catch (e) {
         console.error(`Failed to open settings for ${this.resolve(entity, client, 'name')} (${client} addon)`, e);
      }
   }


   getAddons(): AddonFetchResponse {
      return { addons: { bd: [], powercord: [], unbound: [] }, count: 0 };
   }

   @bind
   onReload() { }

   @bind
   resolve(entity: Record<string, any>, client: string, filter: string, options: Record<string, any> = {}) {
      switch (filter) {
         case 'name':
            return this.resolveName(client, entity);
         case 'id':
            return this.resolveId(client, entity);
         case 'description':
            return this.resolveDescription(client, entity);
         case 'author':
            return this.resolveAuthors(client, entity, options);
         case 'version':
            return this.resolveVersion(client, entity);
         case 'color':
            return this.resolveColor(client, entity);
         case 'settings':
            const id = this.resolve(entity, client, 'id');
            const name = this.resolve(entity, client, 'name');

            const powercord = window.powercord?.api?.settings;

            if (entity.instance?.getSettingsPanel) {
               return entity.instance.getSettingsPanel.bind(entity.instance);
            } else if (entity.getSettingsPanel) {
               return entity.getSettingsPanel.bind(entity);
            } else if (!powercord?.settings) {
               return null;
            }

            if (powercord.settings.has(id)) {
               return powercord.settings.get(id);
            }

            return powercord.settings[id] ?? [...powercord.settings.values()].find(e => {
               const searchable = [e.label, e.category];
               if (searchable.includes(id) || searchable.includes(name)) {
                  return true;
               }
            });
         default:
            return 'Not Found';
      }
   }

   resolveName(client: string, entity) {
      const fallback = Locale.Messages.UNBOUND_ADDON_MISSING_NAME;

      switch (client) {
         case 'bd':
            return entity.name ?? fallback;
         case 'unbound':
            return entity.data.name ?? fallback;
         case 'powercord':
            return entity.displayName ?? fallback;
      }

      return fallback;
   }

   resolveId(client: string, entity) {
      switch (client) {
         case 'bd':
            return entity.name;
         case 'powercord':
            return entity.entityID;
         case 'unbound':
            return entity.id;
      }
   }

   resolveDescription(client: string, entity) {
      const fallback = Locale.Messages.UNBOUND_ADDON_MISSING_DESCRIPTION;

      switch (client) {
         case 'bd':
            return entity.description ?? fallback;
         case 'unbound':
            return entity.data.description ?? fallback;
         case 'powercord':
            return entity.manifest.description ?? fallback;
      }

      return fallback;
   }

   resolveAuthors(client: string, entity, { raw = false }) {
      const fallback = Locale.Messages.UNBOUND_ADDON_MISSING_AUTHOR;

      switch (client) {
         case 'bd':
            const zlib = entity.instance._config?.info?.authors;
            if (!raw && Array.isArray(zlib)) {
               return zlib.map(a => a?.name?.toLowerCase()).filter(Boolean).join(', ');
            }

            return entity.getAuthor?.() ?? entity.author ?? fallback;
         case 'unbound':
            const authors = entity.data.authors;
            if (!raw && Array.isArray(authors)) {
               return authors.map(a => (a?.name ?? a)?.toLowerCase()).filter(Boolean).join(', ');
            }

            return entity.data.authors ?? fallback;
         case 'powercord':
            return entity.manifest.author ?? fallback;
      }

      return fallback;
   }

   resolveVersion(client: string, entity) {
      const fallback = Locale.Messages.UNBOUND_ADDON_MISSING_VERSION;

      switch (client) {
         case 'bd':
            return entity.getVersion?.() ?? entity.version ?? fallback;
         case 'powercord':
            return entity.manifest.version ?? fallback;
         case 'unbound':
            return entity.data.version ?? fallback;
      }

      return fallback;
   }

   resolveColor(client: string, entity) {
      switch (client) {
         case 'bd':
            return '#3E82E5';
         case 'powercord':
            return entity.color ?? entity.manifest.color ?? Colors.BRAND;
         case 'unbound':
            return entity.data.color ?? Colors.BRAND;
      }

      return Colors.BRAND;
   }
}

export default Manager;