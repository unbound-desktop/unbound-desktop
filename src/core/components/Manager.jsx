const { React } = require('@webpack/common');

const { SearchBar, ErrorBoundary } = require('@components');
const AddonCard = require('./AddonCard');

class Manager extends React.PureComponent {
   constructor(props) {
      super();

      this.type = props.type;
      this.entities = {
         unbound: [...unbound.managers[this.type]?.entities?.values() ?? []],
         powercord: [],
         BetterDiscord: []
      };

      if (this.type == 'plugins' && window.powercord?.pluginManager) {
         this.entities.powercord.push(...[...powercord.pluginManager.addons]);
      } else if (this.type == 'themes' && window.powercord?.styleManager) {
         this.entities.powercord.push(...[...powercord.styleManager.addons]);
      }

      if (this.type == 'plugins' && window.BdApi?.Plugins) {
         this.entities.BetterDiscord.push(...[...BdApi.Plugins.getAll()]);
      } else if (this.type == 'themes' && window.BdApi?.Themes) {
         this.entities.BetterDiscord.push(...[...BdApi.Themes.getAll()]);
      }

      this.state = {
         query: null
      };
   }

   render() {
      return (
         <ErrorBoundary>
            <div className='unbound-addon-page-header'>
               <SearchBar
                  onQueryChange={(value) => this.setState({ query: value })}
                  onClear={() => this.setState({ query: '' })}
                  placeholder={`Search ${this.type}...`}
                  size={SearchBar.Sizes.MEDIUM}
                  query={this.state.query}
                  className='unbound-addon-search-bar'
               />
            </div>
            {this.renderEntities()}
         </ErrorBoundary>
      );
   }

   renderEntities() {
      const { get, set } = this.props;

      return Object.entries(this.entities).flatMap(([key, value]) => {
         const entities = value;
         const res = [];

         for (const entity of entities) {
            res.push(
               <AddonCard
                  manager={this.type}
                  type={key}
                  entity={entity}
               />
            );
         }

         return res;
      });

      // return null;
      // return entities.filter(entity => {
      //    entity.type =
      // });
      // for (const key in this.entities) {
      //    const values = this.entities[key];

      //    for (const entity of values) {
      //       entity.type = key;
      //       entities.push(entity);
      //    }
      // }

      // return entities.filter(entity => {
      //    if (this.state.query) {
      //       const filterable = get('filters', ['name', 'description', 'author']);

      //       let matches = 0;
      //       for (const filter of filterable) {
      //          let value;
      //          switch (filter) {
      //             case 'name':
      //                value = entity.name ?? entity.data?.name ?? entity.displayName;
      //                break;
      //             case 'description':
      //                value = (
      //                   entity.manifest?.description ??
      //                   entity.data?.description ??
      //                   entity.description ??
      //                   'No description provided.'
      //                );
      //                break;
      //             case 'author':
      //                value = (
      //                   entity.manifest?.author ??
      //                   entity.data?.author ??
      //                   entity.author ??
      //                   'No description provided.'
      //                );
      //                break;
      //          }

      //          if (value.toLowerCase().includes(this.state.query.toLowerCase())) {
      //             matches++;
      //          }
      //       }

      //       return matches > 0;
      //    }

      //    return true;
      // }).map(e => <AddonCard type={this.type} entity={e} />);
   }
};

module.exports = unbound.apis.settings.connectStores('manager-tab-settings')(Manager);