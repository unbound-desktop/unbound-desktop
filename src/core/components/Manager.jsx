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

      let entities = Object.keys(this.entities).map(type => {
         const entities = this.entities[type];
         entities.map(e => e.type = type);

         return entities;
      }).flat();

      return entities.filter(e => {
         if (this.state.query) {
            const filterable = get('filters', ['name', 'description', 'author']);

            if (filterable.some(f => (e[f] ?? e.data?.[f] ?? e.instance?.[f])?.includes(this.state.query))) {
               return true;
            }

            return false;
         }

         return true;
      }).map(e => <AddonCard type={this.type} entity={e} />);
   }
};

module.exports = unbound.apis.settings.connectStores('manager-tab-settings')(Manager);